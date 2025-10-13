import React, { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";

export default function TasksManager() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchTasks() {
      const { apiFetch } = await import('@/lib/api');
      const res = await apiFetch('/api/tasks');
      if (res.ok) setTasks(await res.json().then(r=>r.tasks));
    }
    fetchTasks();
  }, []);

  if (!user || user.role !== 'ADMIN') return <Layout><div className="p-8">Unauthorized</div></Layout>;

  const handleDelete = async (id: string) => {
    if (!confirm('Delete task?')) return;
    const { apiFetch } = await import('@/lib/api');
    await apiFetch(`/api/tasks/${id}`, { method: 'DELETE' });
    setTasks((s)=>s.filter(t=>t.id!==id));
  };

  const handleEdit = async (task: any) => {
    const title = prompt('Title', task.title) || task.title;
    const reward = Number(prompt('Reward (points)', String(task.reward)) || task.reward);
    const { apiFetch } = await import('@/lib/api');
    await apiFetch(`/api/tasks/${task.id}`, { method: 'PUT', body: JSON.stringify({ title, reward }) });
    setTasks((s)=>s.map(t=> t.id===task.id ? { ...t, title, reward } : t));
  };

  return (
    <Layout>
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Task Manager</h2>
        <div className="space-y-3">
          {tasks.map(t=> (
            <div key={t.id} className="rounded p-3 bg-white/5 flex justify-between items-center">
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-white/70">Reward: {t.reward} HP</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={()=>handleEdit(t)}>Edit</Button>
                <Button onClick={()=>handleDelete(t.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
