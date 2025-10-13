import { RequestHandler } from "express";
import prisma from "../prisma";

export const listTasks: RequestHandler = async (req, res) => {
  const tasks = await prisma.task.findMany();
  res.json({ tasks });
};

export const createTask: RequestHandler = async (req, res) => {
  const { title, description, reward, proofType, visible } = req.body as any;
  const t = await prisma.task.create({ data: { title, description, reward: Number(reward || 0), proofType: proofType || 'LINK', visible: visible ?? true } });
  res.json({ task: t });
};

export const updateTask: RequestHandler = async (req, res) => {
  const { id } = req.params as any;
  const data = req.body as any;
  const t = await prisma.task.update({ where: { id }, data: { ...data } });
  res.json({ task: t });
};

export const deleteTask: RequestHandler = async (req, res) => {
  const { id } = req.params as any;
  await prisma.task.delete({ where: { id } });
  res.json({ ok: true });
};
