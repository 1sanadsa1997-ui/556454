import fetch from "node-fetch";
import prisma from "../prisma";

const API_KEY = process.env.ADSTERRA_API_KEY;
const SITE_ID = process.env.ADSTERRA_SITE_ID || '5346018';

export async function fetchAndDistribute() {
  if (!API_KEY) {
    console.warn('Adsterra API key not configured');
    return null;
  }

  try {
    const url = `https://api.adsterra.com/v1/statistics?date_from=${new Date().toISOString().slice(0,10)}&date_to=${new Date().toISOString().slice(0,10)}&group_by=site`;
    const resp = await fetch(url, { headers: { Authorization: `Bearer ${API_KEY}` } });
    const json = await resp.json();
    const totalRevenue = (json?.data || []).reduce((s: number, entry: any) => s + (Number(entry.revenue) || 0), 0);

    // Calculate distribution per level
    const shares = { 1: 0.10, 2: 0.20, 3: 0.30 };
    const distribution: Record<string, number> = {};

    // Save revenue record
    const revenueRecord = await prisma.adsterraRevenue.create({ data: { date: new Date(), amountUsd: totalRevenue, raw: json || {} } });

    for (const level of Object.keys(shares)) {
      const lvl = Number(level);
      const shareUsd = totalRevenue * (shares as any)[lvl];
      distribution[`Level_${lvl}`] = Math.round(shareUsd * 100) / 100;

      // find users at that level
      const users = await prisma.user.findMany({ where: { level: lvl } });
      if (users.length === 0) continue;
      const perUserUsd = shareUsd / users.length;
      const perUserPoints = Math.round(perUserUsd * 100);

      // create distribution record
      await prisma.revenueDistribution.create({ data: { revenueId: revenueRecord.id, level: lvl, shareUsd: shareUsd, creditedPoints: perUserPoints * users.length } });

      // credit each user (use transaction helper)
      const { createTransactionAndCredit } = require('../lib/transactions');
      for (const u of users) {
        await createTransactionAndCredit(u.id, perUserPoints, 'ADMIN_ADJUST', { source: 'adsterra', revenueId: revenueRecord.id });
      }
    }

    return { totalRevenue, distribution };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default function scheduleAdsterra() {
  // Run once a day
  setInterval(() => {
    fetchAndDistribute().then((r)=> console.log('Adsterra job result', r)).catch(console.error);
  }, 1000 * 60 * 60 * 24);
}
