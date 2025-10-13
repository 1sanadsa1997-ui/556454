import React, { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { useAuth } from "@/hooks/auth";
import { Button } from "@/components/ui/button";

export default function UpgradeRequests() {
  const { user } = useAuth();
  const [reqs, setReqs] = useState<any[]>([]);

  useEffect(() => {
    async function fetchReqs() {
      const { apiFetch } = await import('@/lib/api');
      const res = await apiFetch('/api/admin/upgrade-requests');
      if (res.ok) setReqs(await res.json().then(r=>r.requests));
    }
    fetchReqs();
  }, []);

  if (!user || user.role !== 'ADMIN') return <Layout><div className="p-8">Unauthorized</div></Layout>;

  return (
    <Layout>
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Upgrade Requests</h2>
        <div className="space-y-3">
          {reqs.map(r=> (
            <div key={r.id} className="rounded p-3 bg-white/5 flex justify-between items-center">
              <div>
                <div className="font-semibold">User: {r.userId} → Level {r.targetLevel}</div>
                <div className="text-xs text-white/70">Receipt: <a href={r.receiptUrl} target="_blank" rel="noreferrer">view</a></div>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={async ()=>{ const { apiFetch } = await import('@/lib/api'); await apiFetch('/api/upgrade/approve', { method:'POST', body: JSON.stringify({ requestId: r.id }) }); }}>Approve</Button>
                <Button onClick={async ()=>{ const { apiFetch } = await import('@/lib/api'); await apiFetch('/api/upgrade/reject', { method:'POST', body: JSON.stringify({ requestId: r.id }) }); }}>Reject</Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
