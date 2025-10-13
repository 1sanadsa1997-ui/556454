import Layout from "@/components/common/Layout";
import { useAuth } from "@/hooks/auth";
import { Navigate, Link } from "react-router-dom";

export default function Admin() {
  const { user } = useAuth();
  if (!user || user.role !== "ADMIN") return <Navigate to="/" replace />;

  return (
    <Layout>
      <section className="py-10 space-y-8">
        <h1 className="text-3xl font-extrabold">Admin Panel</h1>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="font-semibold">Wallet Summary</h3>
            <ul className="mt-3 text-sm text-white/80 space-y-1">
              <li>Total earnings: $0</li>
              <li>Paid out: $0</li>
              <li>Current balance: $0</li>
            </ul>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="font-semibold">Tasks</h3>
            <p className="mt-2 text-sm text-white/70">Add/Edit/Delete manual tasks. Import AdGem.</p>
            <Link to="/admin/tasks" className="mt-3 inline-block text-sky-400 hover:underline">Open Task Manager</Link>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="font-semibold">Withdrawals</h3>
            <p className="mt-2 text-sm text-white/70">Review pending USDT withdrawals.</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="font-semibold">Proof Approvals</h3>
            <p className="mt-2 text-sm text-white/70">Approve or reject user proofs.</p>
            <Link to="/admin/upgrade-requests" className="mt-3 inline-block text-sky-400 hover:underline">Review Upgrade Requests</Link>
          </div>
          <div className="rounded-2xl bg-white/5 p-6 ring-1 ring-white/10">
            <h3 className="font-semibold">Users</h3>
            <p className="mt-2 text-sm text-white/70">Manage users, roles, and suspensions.</p>
            <Link to="/admin/users" className="mt-3 inline-block text-sky-400 hover:underline">Open Users</Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
