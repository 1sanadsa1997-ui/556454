import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { adgemWebhook, adgemPostback } from "./routes/adgem";

// Optional: initialize prisma if DATABASE_URL is present
let prisma: any = null;
try {
  // lazy import so local dev without prisma dependency won't crash immediately
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const _prisma = require("./prisma").default;
  prisma = _prisma;
} catch (err) {
  // Prisma client not available or not generated yet. Routes that need DB should check.
  // console.warn("Prisma client not initialized", err);
}

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth
  try {
    const { requestMagicLink, verifyMagicLink, me } = require("./routes/auth");
    const { authenticateToken } = require("./middleware/auth");
    app.post("/api/auth/request", requestMagicLink);
    app.get("/api/auth/verify", verifyMagicLink);
    app.get("/api/auth/me", authenticateToken, me);
  } catch (err) {
    // ignore
  }

  // AdGem integrations (stubs)
  app.all("/api/adgem/webhook", adgemWebhook);
  app.all("/api/adgem/postback", adgemPostback);

  // CPAlead integration
  try {
    const { handleCPALeadPostback, blockPublisher, favoritePublisher, getCPALeadOfferwallUrl } = require("./routes/cpalead");
    const { authenticateToken, adminOnly } = require("./middleware/auth");
    app.all("/api/cpalead/postback", handleCPALeadPostback);
    app.post("/api/cpalead/block-publisher", authenticateToken, adminOnly, blockPublisher);
    app.post("/api/cpalead/favorite-publisher", authenticateToken, adminOnly, favoritePublisher);
    app.get("/api/cpalead/offerwall-url", authenticateToken, getCPALeadOfferwallUrl);
  } catch (err) {
    // ignore
  }

  // Cloudinary uploads
  try {
    const { uploadToCloudinary } = require("./routes/uploads");
    app.post("/api/uploads/cloudinary", uploadToCloudinary);
  } catch (err) {
    // ignore if upload route cannot be registered
  }

  // Proofs
  try {
    const { submitProof, approveProof } = require("./routes/proofs");
    const { authenticateToken, adminOnly } = require("./middleware/auth");
    app.post("/api/proofs/submit", submitProof);
    app.post("/api/proofs/approve", authenticateToken, adminOnly, approveProof);
  } catch (err) {
    // ignore
  }

  // Adsterra job
  try {
    const { fetchAndDistribute, default: scheduleAdsterra } = require("./jobs/adsterra");
    const { authenticateToken, adminOnly } = require("./middleware/auth");
    app.get("/api/adsterra/fetch", authenticateToken, adminOnly, async (_req, res) => {
      const r = await fetchAndDistribute();
      res.json(r || {});
    });
    // start scheduler in background
    scheduleAdsterra();
  } catch (err) {
    // ignore
  }

  // Referrals
  try {
    const { registerReferral } = require("./routes/referrals");
    app.post("/api/referrals/register", registerReferral);
  } catch (err) {
    // ignore
  }

  // Upgrades
  try {
    const { submitUpgradeRequest, approveUpgradeRequest, rejectUpgradeRequest } = require("./routes/upgrade");
    const { authenticateToken, adminOnly } = require("./middleware/auth");
    app.post("/api/upgrade/submit", submitUpgradeRequest);
    app.post("/api/upgrade/approve", authenticateToken, adminOnly, approveUpgradeRequest);
    app.post("/api/upgrade/reject", authenticateToken, adminOnly, rejectUpgradeRequest);
  } catch (err) {
    // ignore
  }

  // Tasks (admin)
  try {
    const { listTasks, createTask, updateTask, deleteTask } = require("./routes/tasks");
    const { authenticateToken, adminOnly } = require("./middleware/auth");
    app.get("/api/tasks", authenticateToken, adminOnly, listTasks);
    app.post("/api/tasks", authenticateToken, adminOnly, createTask);
    app.put("/api/tasks/:id", authenticateToken, adminOnly, updateTask);
    app.delete("/api/tasks/:id", authenticateToken, adminOnly, deleteTask);
  } catch (err) {
    // ignore
  }

  // Admin utilities
  try {
    const { listUsers, updateUser, listUpgradeRequests, listAdmins, createAdmin, updateAdmin, deleteAdmin } = require("./routes/admin");
    const { authenticateToken, adminOnly } = require("./middleware/auth");
    app.get("/api/admin/users", authenticateToken, adminOnly, listUsers);
    app.put("/api/admin/users/:id", authenticateToken, adminOnly, updateUser);
    app.get("/api/admin/upgrade-requests", authenticateToken, adminOnly, listUpgradeRequests);
    app.get("/api/admin/admins", authenticateToken, adminOnly, listAdmins);
    app.post("/api/admin/admins", authenticateToken, adminOnly, createAdmin);
    app.put("/api/admin/admins/:id", authenticateToken, adminOnly, updateAdmin);
    app.delete("/api/admin/admins/:id", authenticateToken, adminOnly, deleteAdmin);
  } catch (err) {
    // ignore
  }

  // Admin extra: wallet logs and analytics
  try {
    const { walletLogs, analytics } = require("./routes/admin_extra");
    const { authenticateToken, adminOnly } = require("./middleware/auth");
    app.get("/api/admin/wallet-logs", authenticateToken, adminOnly, walletLogs);
    app.get("/api/admin/analytics", authenticateToken, adminOnly, analytics);
  } catch (err) {
    // ignore
  }

  // User wallets
  try {
    const { getPlatformWallets } = require("./routes/user-wallets");
    const { authenticateToken } = require("./middleware/auth");
    app.get("/api/user/platform-wallets", authenticateToken, getPlatformWallets);
  } catch (err) {
    // ignore
  }

  return app;
}
