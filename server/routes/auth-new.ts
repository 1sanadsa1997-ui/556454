import { RequestHandler } from "express";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../prisma";
import { sendEmail } from "../lib/email";

const VERIFICATION_AGE_SECONDS = 24 * 60 * 60;
const JWT_ISSUER = "promohive";
const JWT_AUDIENCE = "promohive-email-verification";

type RegisterBody = {
  firstName?: unknown;
  lastName?: unknown;
  username?: unknown;
  email?: unknown;
  password?: unknown;
  gender?: unknown;
  birthDate?: unknown;
  country?: unknown;
};

function jwtSecret(): string {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret || secret.length < 32) {
    throw new Error("JWT_SECRET must be configured and at least 32 characters long");
  }
  return secret;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function ageAtLeast(date: Date, years: number): boolean {
  const now = new Date();
  const cutoff = new Date(now.getFullYear() - years, now.getMonth(), now.getDate());
  return date <= cutoff;
}

function validateRegistration(body: RegisterBody) {
  const firstName = text(body.firstName);
  const lastName = text(body.lastName);
  const username = text(body.username).toLowerCase();
  const email = text(body.email).toLowerCase();
  const password = typeof body.password === "string" ? body.password : "";
  const gender = text(body.gender).toLowerCase();
  const country = text(body.country);
  const birthDateText = text(body.birthDate);

  if (!firstName || !lastName || !username || !email || !password || !gender || !birthDateText || !country) {
    return { error: "First name, last name, username, email, password, gender, birth date, and country are required" };
  }
  if (!/^[a-z0-9_]{3,30}$/.test(username)) {
    return { error: "Username must be 3-30 characters and contain only letters, numbers, or underscores" };
  }
  if (!/^\S+@\S+\.\S+$/.test(email) || email.length > 254) return { error: "Email is invalid" };
  if (password.length < 8 || password.length > 72) return { error: "Password must be 8-72 characters" };
  if (!["male", "female", "other"].includes(gender)) return { error: "Gender is invalid" };

  const birthDate = new Date(`${birthDateText}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthDateText) || Number.isNaN(birthDate.getTime()) || !ageAtLeast(birthDate, 13)) {
    return { error: "You must be at least 13 years old" };
  }
  if (birthDate > new Date()) return { error: "Birth date cannot be in the future" };

  return { value: { firstName, lastName, username, email, password, gender, country, birthDate } };
}

export const register: RequestHandler = async (req, res) => {
  try {
    const parsed = validateRegistration(req.body as RegisterBody);
    if ("error" in parsed) return res.status(400).json({ error: parsed.error });
    const { firstName, lastName, username, email, password, gender, country, birthDate } = parsed.value;

    const passwordHash = await bcrypt.hash(password, 12);
    // PostgreSQL transaction advisory lock serializes the first-user decision.
    // This prevents two concurrent registrations from both becoming ADMIN.
    const user = await prisma.$transaction(async (tx) => {
      await tx.$executeRaw(Prisma.sql`SELECT pg_advisory_xact_lock(hashtext('promohive:first-user'))`);
      const existing = await tx.user.findFirst({ where: { OR: [{ email }, { username }] }, select: { email: true, username: true } });
      if (existing) {
        throw new Error(existing.email === email ? "Email already registered" : "Username already taken");
      }
      const isFirstUser = (await tx.user.count()) === 0;
      return tx.user.create({
        data: {
          firstName, lastName, username, email, password: passwordHash, gender, birthDate, country,
          role: isFirstUser ? "ADMIN" : "USER", hivePoints: 500,
        },
      });
    });

    const token = jwt.sign({ sub: user.id, email: user.email, purpose: "email-verification" }, jwtSecret(), {
      expiresIn: VERIFICATION_AGE_SECONDS,
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    });
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL;
    if (!appUrl) throw new Error("APP_URL is not configured");
    await sendEmail({
      to: user.email,
      subject: "Verify Your PromoHive Account",
      html: `<p>Hi ${user.firstName.replace(/[<>&\"']/g, "")},</p><p><a href="${appUrl}/verify-email?token=${encodeURIComponent(token)}">Verify your email</a></p><p>This link expires in 24 hours.</p>`,
    });
    return res.status(201).json({ success: true, message: "Account created successfully. Please check your email for verification link." });
  } catch (error) {
    if (error instanceof Error && /already registered|already taken/.test(error.message)) return res.status(409).json({ error: error.message });
    if ((error as Prisma.PrismaClientKnownRequestError)?.code === "P2002") return res.status(409).json({ error: "Email or username already registered" });
    console.error("Registration error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const login: RequestHandler = async (req, res) => {
  try {
    const usernameOrEmail = text(req.body?.username).toLowerCase();
    const password = typeof req.body?.password === "string" ? req.body.password : "";
    if (!usernameOrEmail || !password) return res.status(400).json({ error: "Username and password are required" });
    const user = await prisma.user.findFirst({ where: { OR: [{ username: usernameOrEmail }, { email: usernameOrEmail }] } });
    if (!user || !await bcrypt.compare(password, user.password)) return res.status(401).json({ error: "Invalid credentials" });
    if (!user.emailVerified) return res.status(401).json({ error: "Please verify your email before logging in" });
    const token = jwt.sign({ sub: user.id, role: user.role, username: user.username }, jwtSecret(), { expiresIn: "7d", issuer: JWT_ISSUER });
    return res.json({ success: true, token, user: { id: user.id, firstName: user.firstName, lastName: user.lastName, username: user.username, email: user.email, role: user.role, level: user.level, hivePoints: user.hivePoints } });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const token = text(req.query.token);
    if (!token) return res.status(400).json({ error: "Verification token is required" });
    const decoded = jwt.verify(token, jwtSecret(), { issuer: JWT_ISSUER, audience: JWT_AUDIENCE }) as JwtPayload;
    if (decoded.purpose !== "email-verification" || typeof decoded.sub !== "string" || typeof decoded.email !== "string") throw new Error("invalid token claims");
    const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
    if (!user || user.email !== decoded.email) throw new Error("invalid token subject");
    await prisma.user.update({ where: { id: user.id }, data: { emailVerified: true } });
    return res.json({ success: true, message: "Email verified successfully" });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(400).json({ error: "Invalid or expired verification token" });
  }
};
