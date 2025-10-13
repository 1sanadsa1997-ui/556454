import { RequestHandler } from "express";
import prisma from "../prisma";

export const listUsers: RequestHandler = async (req, res) => {
  try {
    const users = await prisma.user.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};

export const updateUser: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params as { id: string };
    const data = req.body as any;
    // Only allow certain fields
    const allowed: any = {};
    if (data.role) allowed.role = data.role;
    if (data.level != null) allowed.level = Number(data.level);
    if (data.hivePoints != null) allowed.hivePoints = Number(data.hivePoints);
    if (data.overrideUnlock != null) allowed.overrideUnlock = Boolean(data.overrideUnlock);
    if (data.suspended != null) allowed.suspended = Boolean(data.suspended);

    const user = await prisma.user.update({ where: { id }, data: allowed });
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};

export const listUpgradeRequests: RequestHandler = async (req, res) => {
  try {
    const requests = await prisma.upgradeRequest.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ requests });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};


// Admin management functions
export const listAdmins: RequestHandler = async (req, res) => {
  try {
    const admins = await prisma.user.findMany({
      where: {
        role: {
          in: ['ADMIN', 'SUPER_ADMIN']
        }
      },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ admins });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};

export const createAdmin: RequestHandler = async (req, res) => {
  try {
    const { email, role } = req.body as { email: string; role: string };
    
    if (!email || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    
    if (existingUser) {
      // Update existing user's role
      const updatedUser = await prisma.user.update({
        where: { email },
        data: { role: role as any },
      });
      return res.json({ admin: updatedUser });
    }
    
    // Create new admin user
    const newAdmin = await prisma.user.create({
      data: {
        email,
        role: role as any,
        hivePoints: 0,
      },
    });
    
    res.json({ admin: newAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};

export const updateAdmin: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role } = req.body as { email?: string; role?: string };
    
    const updateData: any = {};
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    
    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: updateData,
    });
    
    res.json({ admin: updatedAdmin });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};

export const deleteAdmin: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Check if admin exists
    const admin = await prisma.user.findUnique({ where: { id } });
    
    if (!admin) {
      return res.status(404).json({ error: 'Admin not found' });
    }
    
    // Delete admin
    await prisma.user.delete({ where: { id } });
    
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};

