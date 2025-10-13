import { RequestHandler } from "express";
import prisma from "../prisma";

export const registerReferral: RequestHandler = async (req, res) => {
  try {
    const { referrerId, refereeId } = req.body as { referrerId?: string; refereeId?: string };
    if (!referrerId || !refereeId) return res.status(400).json({ error: "missing fields" });

    const referrer = await prisma.user.findUnique({ where: { id: referrerId } });
    const referee = await prisma.user.findUnique({ where: { id: refereeId } });
    if (!referrer || !referee) return res.status(404).json({ error: "user not found" });

    // Create referral record
    const rec = await prisma.referral.create({ data: { referrerId, refereeId, level: referrer.level } });
    return res.json({ referral: rec });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};

export const checkAndPayReferralPayouts = async (referrerId: string) => {
  // Find referrer
  const referrer = await prisma.user.findUnique({ where: { id: referrerId } });
  if (!referrer) return null;
  if (referrer.level < 1) return null; // only paid members

  // Count invitees who have same level as referrer
  const matched = await prisma.referral.findMany({ where: { referrerId } });
  const refereeIds = matched.map((m) => m.refereeId);
  const referees = await prisma.user.findMany({ where: { id: { in: refereeIds }, level: referrer.level } });
  const count = referees.length;

  const groups = Math.floor(count / 5);
  const already = referrer.referralPayouts || 0;
  const newPayouts = groups - already;
  if (newPayouts <= 0) return { paid: 0 };

  // Reward mapping
  const rewards: Record<number, number> = { 1: 70, 2: 130, 3: 180 };
  const rewardPerGroup = rewards[referrer.level] || 0;
  const totalUsd = rewardPerGroup * newPayouts;
  const totalPoints = Math.round(totalUsd * 100); // USD -> HivePoints

  // Create transaction and credit user using helper
  const { createTransactionAndCredit } = require('../lib/transactions');
  const res = await createTransactionAndCredit(referrerId, totalPoints, 'TASK_REWARD', { type: 'referral', groups: newPayouts, usd: totalUsd });
  await prisma.user.update({ where: { id: referrerId }, data: { referralPayouts: already + newPayouts } as any });

  return { paid: res.credited, usd: totalUsd };
};
