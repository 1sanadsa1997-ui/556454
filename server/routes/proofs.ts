import { RequestHandler } from "express";
import prisma from "../prisma";

export const submitProof: RequestHandler = async (req, res) => {
  try {
    const { userId, taskId, url, type } = req.body as { userId: string; taskId: string; url: string; type: string };
    if (!userId || !taskId || !url) return res.status(400).json({ error: "missing fields" });

    const proof = await prisma.proof.create({ data: { userId, taskId, url, type: type === 'image' ? 'IMAGE' : 'LINK' } });
    return res.json({ proof });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};

export const approveProof: RequestHandler = async (req, res) => {
  try {
    const { proofId } = req.body as { proofId: string };
    const adminId = (req as any).user?.id;
    const p = await prisma.proof.findUnique({ where: { id: proofId } });
    if (!p) return res.status(404).json({ error: "not found" });

    // Mark approved and credit user
    await prisma.proof.update({ where: { id: proofId }, data: { status: 'APPROVED', reviewedAt: new Date() } });

    const task = await prisma.task.findUnique({ where: { id: p.taskId } });
    if (task) {
      const { createTransactionAndCredit } = require("../lib/transactions");
      await createTransactionAndCredit(p.userId, task.reward, 'TASK_REWARD', { taskId: task.id, adminId });
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: String(err) });
  }
};
