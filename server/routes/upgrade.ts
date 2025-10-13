import { RequestHandler } from "express";
import prisma from "../prisma";
import { checkAndPayReferralPayouts } from "./referrals";

export const submitUpgradeRequest: RequestHandler = async (req, res) => {
  try {
    const { userId, targetLevel, walletAddress, receiptUrl } = req.body as { userId: string; targetLevel: number; walletAddress: string; receiptUrl: string };
    if (!userId || targetLevel == null || !walletAddress || !receiptUrl) return res.status(400).json({ error: "missing fields" });

    const reqRec = await prisma.upgradeRequest.create({ data: { userId, targetLevel, walletAddress, receiptUrl } });
    return res.json({ request: reqRec });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};

export const approveUpgradeRequest: RequestHandler = async (req, res) => {
  try {
    const { requestId } = req.body as { requestId: string };
    const adminId = (req as any).user?.id;
    if (!requestId) return res.status(400).json({ error: "missing requestId" });

    const up = await prisma.upgradeRequest.findUnique({ where: { id: requestId } });
    if (!up) return res.status(404).json({ error: "not found" });
    if (up.status !== 'PENDING') return res.status(400).json({ error: "already reviewed" });

    // Update user level and mark request approved
    await prisma.upgradeRequest.update({ where: { id: requestId }, data: { status: 'APPROVED', reviewedAt: new Date(), adminNote: `Approved by ${adminId || 'admin'}` } });
    await prisma.user.update({ where: { id: up.userId }, data: { level: up.targetLevel } as any });

    // Provide reward if needed and check referrals
    await checkAndPayReferralPayouts((await prisma.user.findUnique({ where: { id: up.userId } }))?.id || '');

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};

export const rejectUpgradeRequest: RequestHandler = async (req, res) => {
  try {
    const { requestId, adminNote } = req.body as { requestId: string; adminNote?: string };
    const adminId = (req as any).user?.id;
    if (!requestId) return res.status(400).json({ error: "missing requestId" });
    await prisma.upgradeRequest.update({ where: { id: requestId }, data: { status: 'REJECTED', reviewedAt: new Date(), adminNote: `${adminNote || ''} (by ${adminId || 'admin'})` } });
    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};
