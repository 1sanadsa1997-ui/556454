import React, { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";

export default function UsersManager() {
  const { user } = useAuth();
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    async function fetchUsers() {
      const { apiFetch } = await import('@/lib/api');
      const res = await apiFetch('/api/admin/users');
      if (res.ok) setUsers(await res.json().then(r=>r.users));
    }
    fetchUsers();
  }, []);

  if (!user || user.role !== 'ADMIN') return <Layout><div className="p-8">Unauthorized</div></Layout>;

  const handleEdit = async (u: any) => {
    const level = Number(prompt('Level', String(u.level)) || u.level);
    const points = Number(prompt('HivePoints', String(u.hivePoints)) || u.hivePoints);
    const suspended = confirm('Suspend user? Click OK to suspend, Cancel to keep current.');
    const { apiFetch } = await import('@/lib/api');
    await apiFetch(`/api/admin/users/${u.id}`, { method: 'PUT', body: JSON.stringify({ level, hivePoints: points, suspended }) });
    setUsers((s)=>s.map(x=> x.id===u.id ? { ...x, level, hivePoints: points, suspended } : x));
  };

  return (
    <Layout>
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Users</h2>
        <div className="space-y-3">
          {users.map(u=> (
            <div key={u.id} className="rounded p-3 bg-white/5 flex justify-between items-center">
              <div>
                <div className="font-semibold">{u.email}</div>
                <div className="text-xs text-white/70">Level: {u.level} • Points: {u.hivePoints}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={()=>handleEdit(u)}>Edit</Button>
                <Button onClick={async ()=>{ if(confirm('Disable user?')){ const { apiFetch } = await import('@/lib/api'); await apiFetch(`/api/admin/users/${u.id}`, { method:'PUT', body: JSON.stringify({ suspended:true }) }); setUsers((s)=>s.map(x=> x.id===u.id ? { ...x, suspended:true } : x)); } }}>Disable</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
