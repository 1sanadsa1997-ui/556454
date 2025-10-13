import prisma from "../prisma";

export const LEVEL_MULTIPLIERS: Record<number, number> = {
  0: 0.15, // 15%
  1: 0.35,
  2: 0.55,
  3: 0.75,
};

export async function createTransactionAndCredit(userId: string, basePoints: number, kind: string, meta: any = {}) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("user not found");

  let finalPoints = basePoints;
  // apply multiplier for task rewards
  if (kind === "TASK_REWARD") {
    const mult = LEVEL_MULTIPLIERS[user.level] ?? 0;
    finalPoints = Math.round(basePoints * (1 + mult));
  }

  // enforce level 0 cap: 990 points (9.9 USD)
  if (user.level === 0 && !user.overrideUnlock) {
    const cap = 990;
    const available = Math.max(0, cap - user.hivePoints);
    const allowed = Math.min(finalPoints, available);

    if (allowed <= 0) {
      // do not create a credit transaction if nothing can be credited
      return { credited: 0, finalPoints, note: 'level0_cap' };
    }
    finalPoints = allowed;
  }

  const tx = await prisma.transaction.create({ data: { userId, amount: finalPoints, kind: kind as any, meta } });
  await prisma.user.update({ where: { id: userId }, data: { hivePoints: { increment: finalPoints } } as any });

  return { credited: finalPoints, finalPoints };
}
