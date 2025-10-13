import { RequestHandler } from "express";
import prisma from "../prisma";

export const walletLogs: RequestHandler = async (req, res) => {
  try {
    const logs = await prisma.transaction.findMany({ orderBy: { createdAt: 'desc' }, take: 200 });
    res.json({ logs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};

export const analytics: RequestHandler = async (req, res) => {
  try {
    // last 30 days earnings grouped by day
    const since = new Date();
    since.setDate(since.getDate() - 30);
    const txs = await prisma.transaction.findMany({ where: { createdAt: { gte: since } } });
    const byDay: Record<string, number> = {};
    for (const t of txs) {
      const d = t.createdAt.toISOString().slice(0,10);
      byDay[d] = (byDay[d] || 0) + (t.amount || 0);
    }
    const data = Object.keys(byDay).sort().map(date=> ({ date, points: byDay[date] }));
    res.json({ data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: String(err) });
  }
};
