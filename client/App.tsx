import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/hooks/auth";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { createRoot } from "react-dom/client";

import Admin from "./pages/Admin";
import Dashboard from "./pages/Dashboard";
import EmailVerification from "./pages/EmailVerification";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Register from "./pages/Register";
import TasksManager from "./pages/admin/TasksManager";
import UpgradeRequests from "./pages/admin/UpgradeRequests";
import UsersManager from "./pages/admin/UsersManager";
import WalletLogs from "./pages/admin/WalletLogs";

const queryClient = new QueryClient();
const routerFuture = { v7_startTransition: true, v7_relativeSplatPath: true };

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter future={routerFuture}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/admin/tasks" element={<TasksManager />} />
            <Route path="/admin/users" element={<UsersManager />} />
            <Route path="/admin/upgrade-requests" element={<UpgradeRequests />} />
            <Route path="/admin/wallet-logs" element={<WalletLogs />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
