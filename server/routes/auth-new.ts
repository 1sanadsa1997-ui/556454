import { RequestHandler } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendEmail } from "../lib/email";

const prisma = new PrismaClient();

interface RegisterData {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  gender: string;
  birthDate: string;
  country: string;
}

interface LoginData {
  username: string;
  password: string;
}

// Register new user
export const register: RequestHandler = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      username,
      email,
      password,
      gender,
      birthDate,
      country
    }: RegisterData = req.body;

    // Validate required fields
    if (!firstName || !lastName || !username || !email || !password || !gender || !birthDate || !country) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        error: existingUser.email === email.toLowerCase() 
          ? "Email already registered" 
          : "Username already taken" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        username: username.toLowerCase(),
        email: email.toLowerCase(),
        password: hashedPassword,
        gender,
        birthDate: new Date(birthDate),
        country,
        role: 'USER',
        level: 0,
        hivePoints: 500, // Welcome bonus
        emailVerified: false,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    // Generate email verification token
    const verificationToken = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    // Send verification email
    const verificationLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://globalpromonetwork.store'}/verify-email?token=${verificationToken}`;
    
    await sendEmail({
      to: user.email,
      subject: "Verify Your PromoHive Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to PromoHive!</h2>
          <p>Hi ${user.firstName},</p>
          <p>Thank you for registering with PromoHive. Please click the button below to verify your email address:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verificationLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Verify Email</a>
          </div>
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #666;">${verificationLink}</p>
          <p>This link will expire in 24 hours.</p>
          <p>Best regards,<br>The PromoHive Team</p>
        </div>
      `
    });

    res.json({
      success: true,
      message: "Account created successfully. Please check your email for verification link.",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Login user
export const login: RequestHandler = async (req, res) => {
  try {
    const { username, password }: LoginData = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    // Find user by username or email
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: username.toLowerCase() },
          { email: username.toLowerCase() }
        ]
      }
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if email is verified
    if (!user.emailVerified) {
      return res.status(401).json({ error: "Please verify your email before logging in" });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        sub: user.id, 
        role: user.role,
        username: user.username 
      },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role,
        level: user.level,
        hivePoints: user.hivePoints
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Verify email
export const verifyEmail: RequestHandler = async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).json({ error: "Verification token is required" });
    }

    // Verify token
    const decoded = jwt.verify(token as string, process.env.JWT_SECRET || "secret") as any;
    
    // Update user email verification status
    const user = await prisma.user.update({
      where: { id: decoded.userId },
      data: { 
        emailVerified: true,
        updatedAt: new Date()
      }
    });

    res.json({
      success: true,
      message: "Email verified successfully",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Email verification error:', error);
    res.status(400).json({ error: "Invalid or expired verification token" });
  }
};
