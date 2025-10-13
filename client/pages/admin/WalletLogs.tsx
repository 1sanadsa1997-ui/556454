import React, { useEffect, useState } from "react";
import Layout from "@/components/common/Layout";
import { useAuth } from "@/hooks/auth";
import { apiFetch } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function WalletLogs() {
  const { user } = useAuth();
  const [logs, setLogs] = useState<any[]>([]);
  const [chart, setChart] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      const res = await apiFetch('/api/admin/wallet-logs');
      if (res.ok) setLogs(await res.json().then(r=>r.logs));
      const r2 = await apiFetch('/api/admin/analytics');
      if (r2.ok) setChart(await r2.json().then(r=>r.data));
    }
    load();
  }, []);

  if (!user || user.role !== 'ADMIN') return <Layout><div className="p-8">Unauthorized</div></Layout>;

  return (
    <Layout>
      <div className="py-8">
        <h2 className="text-2xl font-bold mb-4">Wallet Logs & Analytics</h2>
        <div className="rounded p-4 bg-white/5 mb-6">
          <h3 className="text-sm text-white/80 mb-2">Earnings (last 30 days)</h3>
          <div style={{ width: '100%', height: 240 }}>
            <ResponsiveContainer>
              <LineChart data={chart}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="points" stroke="#8884d8" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-2">
          {logs.map(l=> (
            <div key={l.id} className="rounded p-3 bg-white/5 flex justify-between">
              <div>
                <div className="font-semibold">{l.kind}</div>
                <div className="text-xs text-white/70">User: {l.userId} • {new Date(l.createdAt).toLocaleString()}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{l.amount} HP</div>
                <div className="text-xs text-white/60">{l.meta?.source || ''}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}
