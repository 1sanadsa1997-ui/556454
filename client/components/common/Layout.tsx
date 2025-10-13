import React from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/auth";
import { cn } from "@/lib/utils";

const logoUrl = "/promohive-logo.png";

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 backdrop-blur bg-gradient-to-r from-[#0b1225]/80 via-[#0b1225]/70 to-[#0b1225]/80">
      <div className="container mx-auto flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img src={logoUrl} alt="PromoHive" className="h-8 w-8 rounded" />
          <span className="font-extrabold tracking-tight text-white">PromoHive</span>
        </Link>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <NavLink to="/" className={({isActive})=>cn("text-white/80 hover:text-white transition", isActive && "text-white")}>Home</NavLink>
          <NavLink to="/dashboard" className={({isActive})=>cn("text-white/80 hover:text-white transition", isActive && "text-white")}>Dashboard</NavLink>
          {user?.role === "ADMIN" && (
            <NavLink to="/admin" className={({isActive})=>cn("text-amber-300/90 hover:text-amber-200 transition", isActive && "text-amber-200")}>Admin</NavLink>
          )}
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-xs text-white/70">{user.email}</span>
              <Button size="sm" variant="secondary" onClick={() => { logout(); navigate("/"); }}>
                Logout
              </Button>
            </>
          ) : (
            <Button size="sm" asChild>
              <Link to="/dashboard">Get Started</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#0b1225] text-white/70">
      <div className="container mx-auto py-10 grid gap-6 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <img src={logoUrl} alt="PromoHive" className="h-8 w-8" />
            <span className="font-semibold text-white">PromoHive</span>
          </div>
          <p className="mt-2 text-sm">Global Promo Network • Earn with tasks, referrals, and ads.</p>
        </div>
        <div className="text-sm">
          <p>USDT payouts • Secure • Fast</p>
          <p className="mt-2">© 2021 PromoHive</p>
        </div>
        <div className="text-sm opacity-80">
          Built with care. Stay safe online.
        </div>
      </div>
    </footer>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0b1225] via-[#0b1225] to-[#0b1225] text-white">
      <Header />
      <main className="container mx-auto px-4">{children}</main>
      <Footer />
    </div>
  );
}
