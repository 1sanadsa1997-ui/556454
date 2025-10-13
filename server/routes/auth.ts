import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import prisma from "../prisma";
import fs from 'fs';
import path from 'path';

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASS = process.env.SMTP_PASS;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_PORT = Number(process.env.SMTP_PORT || 465);
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "1sanadsa1997@gmil.com";

// Load email template
let emailTemplate: string;
try {
  emailTemplate = fs.readFileSync(
    path.join(__dirname, '../templates/email-template.html'),
    'utf-8'
  );
} catch (err) {
  console.warn('Email template not found, using default HTML');
  emailTemplate = '<html><body>{{content}}</body></html>';
}

export const requestMagicLink: RequestHandler = async (req, res) => {
  const { email } = req.body as { email?: string };
  if (!email) return res.status(400).json({ error: "missing email" });

  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: "15m" });
  const verifyUrl = `${req.protocol}://${req.get("host")}/api/auth/verify?token=${token}`;

  // In development return token directly so dev flow can auto-verify
  if (process.env.NODE_ENV !== 'production') {
    return res.json({ token, verifyUrl });
  }

  try {
    if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) throw new Error("SMTP not configured");

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_PORT === 465,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    // Create email content
    const emailContent = `
      <h2>Welcome to PromoHive!</h2>
      <p>Click the button below to sign in to your account:</p>
      <a href="${verifyUrl}" class="button">Sign In to PromoHive</a>
      <p>This link will expire in 15 minutes.</p>
      <p>If you didn't request this email, you can safely ignore it.</p>
    `;

    // Replace variables in template
    const htmlContent = emailTemplate
      .replace('{{subject}}', 'Your PromoHive Magic Link')
      .replace('{{content}}', emailContent)
      .replace('{{email}}', email);

    await transporter.sendMail({
      to: email,
      from: SMTP_USER,
      subject: "Your PromoHive Magic Link",
      html: htmlContent,
    });
  } catch (err) {
    console.warn("Failed to send email, returning token in response", err);
    return res.json({ token, verifyUrl });
  }

  return res.json({ success: true });
};

export const verifyMagicLink: RequestHandler = async (req, res) => {
  const { token } = req.query as { token?: string };
  if (!token) return res.status(400).json({ error: "missing token" });

  try {
    const payload = jwt.verify(token, JWT_SECRET) as { email: string };
    const email = payload.email.toLowerCase();

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const usersCount = await prisma.user.count();
      const role = (usersCount === 0 || email === (ADMIN_EMAIL || "")) ? "ADMIN" : "USER";
      user = await prisma.user.create({ data: { email, role, hivePoints: 500 } }); // Welcome bonus: $5 = 500 points
      
      // Create transaction record for welcome bonus
      await prisma.transaction.create({
        data: {
          userId: user.id,
          amount: 500,
          kind: "ADMIN_ADJUST",
          meta: { reason: "Welcome bonus" }
        }
      });
    }

    const sessionToken = jwt.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });

    return res.json({ token: sessionToken, user: { id: user.id, email: user.email, role: user.role } });
  } catch (err) {
    console.error(err);
    return res.status(400).json({ error: "invalid or expired token" });
  }
};

export const me: RequestHandler = async (req, res) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization as string | undefined;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ error: "missing token" });
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload || !payload.sub) return res.status(401).json({ error: "invalid token" });
    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "user not found" });
    return res.json({ user: { id: user.id, email: user.email, role: user.role, level: user.level, hivePoints: user.hivePoints } });
  } catch (err) {
    return res.status(401).json({ error: "unauthorized" });
  }
};
