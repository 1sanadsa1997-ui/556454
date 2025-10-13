import { RequestHandler } from "express";
import prisma from "../prisma";

const ok = (res: any) => res.status(200).json({ status: "ok" });

function validateSecret(req: any) {
  const secret = process.env.ADGEM_WEBHOOK_SECRET || process.env.ADGEM_POSTBACK_KEY || process.env.ADGEM_SECRET;
  const token = (req.query?.token as string) || req.headers["x-adgem-token"] || req.headers["x-adgem-signature"] || req.body?.signature;
  if (!secret) return true; // no secret configured
  return token === secret;
}

export const adgemWebhook: RequestHandler = async (req, res) => {
  try {
    if (!validateSecret(req)) return res.status(401).json({ error: "invalid token" });
    const payload = req.body || {};
    // Example fields: playerid, amount, offerid, payout, transaction_id
    const playerid = payload.playerid || payload.playerId || payload.userid || payload.user_id;
    const payout = Number(payload.payout || payload.amount || 0);
    if (!playerid) return res.status(400).json({ error: "missing playerid" });

    // Find user by external id mapping (using email as fallback) - assume playerid is user id in our system
    const user = await prisma.user.findUnique({ where: { id: playerid } });
    if (user) {
      // credit user in points (usd * 100)
      const { createTransactionAndCredit } = require('../lib/transactions');
      await createTransactionAndCredit(user.id, Math.round(payout * 100), 'TASK_REWARD', { source: 'adgem', payload });
    }

    await prisma.transaction.create({ data: { userId: user?.id || '\', amount: Math.round(payout * 100), kind: \'TASK_REWARD\', meta: { src: \'adgem', payload } } ).catch(()=>{});
    return ok(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};

export const adgemPostback: RequestHandler = async (req, res) => {
  try {
    if (!validateSecret(req)) return res.status(401).json({ error: "invalid token" });
    const params = req.query || req.body || {};
    const userId = params.userid || params.playerid || params.user_id;
    const payout = Number(params.payout || params.amount || 0);

    if (userId && payout > 0) {
      const user = await prisma.user.findUnique({ where: { id: String(userId) } });
      if (user) {
        const { createTransactionAndCredit } = require('../lib/transactions');
        await createTransactionAndCredit(user.id, Math.round(payout * 100), 'TASK_REWARD', { source: 'adgem_postback', params });
      }
      await prisma.transaction.create({ data: { userId: String(userId), amount: Math.round(payout * 100), kind: 'TASK_REWARD\', meta: { src: \'adgem_postback', params } } ).catch(()=>{});
    }

    return ok(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};
