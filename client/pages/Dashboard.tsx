import Layout from "@/components/common/Layout";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import React, { useEffect, useMemo, useState } from "react";

const ADGEM_APP_ID = "31283";
const ADGEM_IFRAME = `https://api.adgem.com/v1/wall?appid=${ADGEM_APP_ID}&playerid=`;

const adsterraScript = `<div class='adsterra-banner'><script type='text/javascript'>atOptions={'key':'d3e9414decc3d72a6de219c8a2aa1f0f','format':'iframe','height':300,'width':160,'params':{}};</script><script type='text/javascript' src='//www.highperformanceformat.com/d3e9414decc3d72a6de219c8a2aa1f0f/invoke.js'></script></div>`;

interface ManualTask { id: string; title: string; reward: number; proofType: 'image'|'link'; }

const demoTasks: ManualTask[] = [
  { id: 't1', title: 'Follow our X account', reward: 25, proofType: 'link' },
  { id: 't2', title: 'Join Telegram channel', reward: 30, proofType: 'link' },
  { id: 't3', title: 'Upload screenshot of app share', reward: 60, proofType: 'image' },
];

export default function Dashboard() {
  const { user, loginWithEmail } = useAuth();
  const [balance, setBalance] = useState(500); // in HivePoints
  const [selectedTask, setSelectedTask] = useState<ManualTask | null>(null);
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (!user) return;
    // Welcome + referral bonus demo credit on first login
    const key = `ph_bonus_${user.id}`;
    if (!localStorage.getItem(key)) {
      setBalance((b) => b + 500); // +$5 welcome => 500 points
      localStorage.setItem(key, '1');
    }
  }, [user]);

  const adgemUrl = useMemo(() => `${ADGEM_IFRAME}${user?.id ?? 'guest'}`,[user]);

  return (
    <Layout>
      <section className="py-8">
        {!user && (
          <div className="mb-8 rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="font-semibold">Sign in</h3>
            <p className="mt-2 text-sm text-white/70">Email-only magic link (simulated). First account becomes Admin automatically.</p>
            <form className="mt-4 flex gap-2" onSubmit={async (e)=>{ e.preventDefault(); await loginWithEmail(email); }}>
              <input required type="email" value={email} onChange={(e)=>setEmail(e.target.value)} placeholder="you@example.com" className="flex-1 rounded-md bg-black/20 px-3 py-2 text-sm outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-sky-500" />
              <Button type="submit">Continue</Button>
            </form>
          </div>
        )}
        <div className="grid gap-6 md:grid-cols-4">
          <div className="md:col-span-3 space-y-6">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-white/70">Balance</p>
                  <h2 className="text-3xl font-extrabold text-white">{balance.toLocaleString()} HivePoints</h2>
                  <p className="text-xs text-white/60">≈ ${(balance/100).toFixed(2)} USD</p>
                </div>
                <div className="flex gap-3">
                  <Button disabled={balance < 1000} title="Min $10 (1000 points)">Withdraw</Button>
                  <Button variant="secondary">Upgrade Level</Button>
                </div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="rounded-2xl bg-white/5 p-0 ring-1 ring-white/10 overflow-hidden">
                <div className="border-b border-white/10 px-6 py-4 font-semibold">AdGem Offers</div>
                <iframe title="AdGem Offerwall" src={adgemUrl} className="w-full h-[520px] bg-white"></iframe>
              </div>

              <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Manual Tasks</h3>
                </div>
                <ul className="mt-4 space-y-3">
                  {demoTasks.map((t)=> (
                    <li key={t.id} className="flex items-center justify-between rounded-lg bg-white/5 px-4 py-3">
                      <div>
                        <p className="font-medium">{t.title}</p>
                        <p className="text-xs text-white/60">Reward: {t.reward} HP</p>
                      </div>
                      <Button size="sm" onClick={()=>setSelectedTask(t)}>Submit Proof</Button>
                    </li>
                  ))}
                </ul>

                {selectedTask && (
                  <div className="mt-4 rounded-lg border border-white/10 p-4">
                    <p className="font-semibold">Submit proof • {selectedTask.title}</p>
                    {selectedTask.proofType === 'link' ? (
                      <form className="mt-3 flex gap-2" onSubmit={async (e)=>{ e.preventDefault(); const form = e.target as HTMLFormElement; const input = (form.querySelector('input') as HTMLInputElement).value; // send to API
                        try {
                          await fetch('/api/proofs/submit', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('ph_token')||''}`}, body: JSON.stringify({ userId: (localStorage.getItem('ph_user')? JSON.parse(localStorage.getItem('ph_user')||'null').id : null), taskId: selectedTask.id, url: input, type: 'link' }) });
                          setSelectedTask(null);
                          setBalance(b=> b + selectedTask.reward);
                          const { notify } = await import('@/lib/notify');
                          notify.success('Proof submitted. Admin will review shortly.');
                        } catch (err) {
                          const { notify } = await import('@/lib/notify');
                          notify.error('Failed to submit proof');
                        }
                      }}>
                        <input required type="url" placeholder="Paste proof link" className="flex-1 rounded-md bg-black/20 px-3 py-2 text-sm outline-none ring-1 ring-inset ring-white/10 focus:ring-2 focus:ring-sky-500" />
                        <Button type="submit">Send</Button>
                      </form>
                    ) : (
                      <form className="mt-3 flex items-center gap-2" onSubmit={async (e)=>{ e.preventDefault(); const form = e.target as HTMLFormElement; const fileInput = form.querySelector('input[type=file]') as HTMLInputElement; const file = fileInput.files?.[0]; if (!file) return; const reader = new FileReader(); reader.onload = async () => {
                        const data = reader.result as string;
                        try {
                          await fetch('/api/uploads/cloudinary', { method:'POST', headers:{'Content-Type':'application/json', Authorization:`Bearer ${localStorage.getItem('ph_token')||''}`}, body: JSON.stringify({ image: data, filename: `${Date.now()}` }) });
                          setSelectedTask(null);
                          setBalance(b=> b + selectedTask.reward);
                          const { notify } = await import('@/lib/notify');
                          notify.success('Proof uploaded. Admin will review shortly.');
                        } catch (err) {
                          const { notify } = await import('@/lib/notify');
                          notify.error('Upload failed');
                        }
                      };
                      reader.readAsDataURL(file);
                      }}>
                        <input required type="file" accept="image/*" className="flex-1 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-sky-600 file:px-3 file:py-2 file:text-white" />
                        <Button type="submit">Send</Button>
                      </form>
                    )}
                    <p className="mt-2 text-xs text-white/60">Admin will review and approve.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
              <h3 className="font-semibold">Referral</h3>
              <p className="mt-2 text-sm text-white/70">Invite friends. Earn up to $70 + $5 per invite at level 1, more on higher levels.</p>
              <Button className="mt-3 w-full">Copy Invite Link</Button>
            </div>
            <div className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
              <div className="text-center" dangerouslySetInnerHTML={{ __html: adsterraScript }} />
            </div>
          </aside>
        </div>
      </section>
    </Layout>
  );
}
