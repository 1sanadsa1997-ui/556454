import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import prisma from "../prisma";

const JWT_SECRET = process.env.JWT_SECRET || "secret";

export interface AuthRequest extends Express.Request {
  user?: any;
}

export const authenticateToken: RequestHandler = async (req: AuthRequest, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization as string | undefined;
    if (!header || !header.startsWith("Bearer ")) return res.status(401).json({ error: "missing token" });
    const token = header.split(" ")[1];
    const payload = jwt.verify(token, JWT_SECRET) as any;
    if (!payload || !payload.sub) return res.status(401).json({ error: "invalid token" });

    const user = await prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) return res.status(401).json({ error: "user not found" });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "unauthorized" });
  }
};

export const adminOnly: RequestHandler = (req: AuthRequest, res, next) => {
  const user = (req as any).user;
  if (!user) return res.status(401).json({ error: "unauthorized" });
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") return res.status(403).json({ error: "forbidden" });
  next();
};
