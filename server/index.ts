import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { adgemWebhook, adgemPostback } from "./routes/adgem";
import { register, login, verifyEmail } from "./routes/auth-new";

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
  app.use(cors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8080', 
      'https://globalpromonetwork.store',
      'https://www.globalpromonetwork.store'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Handle preflight OPTIONS requests
  app.options('*', (req, res) => {
    res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');
    res.sendStatus(200);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Auth Routes - Direct Implementation
  app.post("/api/auth/request", async (req, res) => {
    try {
      const { email } = req.body as { email?: string };
      if (!email) return res.status(400).json({ error: "missing email" });

      // Simple magic link generation
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || "secret";
      const token = jwt.default.sign({ email: email.toLowerCase() }, JWT_SECRET, { expiresIn: "15m" });
      
      const magicLink = `${process.env.NEXT_PUBLIC_APP_URL || 'https://globalpromonetwork.store'}/api/auth/verify?token=${token}`;
      
      // Send email (simplified)
      console.log(`Magic link for ${email}: ${magicLink}`);
      
      res.json({ success: true, message: "Magic link sent to email" });
    } catch (err) {
      console.error('Auth request error:', err);
      res.status(500).json({ error: String(err) });
    }
  });

  app.get("/api/auth/verify", async (req, res) => {
    try {
      const { token } = req.query as { token?: string };
      if (!token) return res.status(400).json({ error: "missing token" });

      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || "secret";
      const payload = jwt.default.verify(token, JWT_SECRET) as { email: string };
      const email = payload.email.toLowerCase();

      // Create or find user
      let user;
      if (prisma) {
        user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
          const usersCount = await prisma.user.count();
          const role = (usersCount === 0 || email === (process.env.ADMIN_EMAIL || "")) ? "ADMIN" : "USER";
          user = await prisma.user.create({ 
            data: { 
              email, 
              role, 
              hivePoints: 500 
            } 
          });
        }
      } else {
        // Fallback without database
        user = { id: '1', email, role: 'USER', hivePoints: 500 };
      }

      const sessionToken = jwt.default.sign({ sub: user.id, role: user.role }, JWT_SECRET, { expiresIn: "7d" });
      res.json({ token: sessionToken, user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
      console.error('Auth verify error:', err);
      res.status(400).json({ error: "invalid or expired token" });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const jwt = await import('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || "secret";
      const payload = jwt.default.verify(token, JWT_SECRET) as { sub: string, role: string };

      let user;
      if (prisma) {
        user = await prisma.user.findUnique({ where: { id: payload.sub } });
      } else {
        user = { id: payload.sub, email: 'user@example.com', role: payload.role };
      }

      if (!user) return res.status(404).json({ error: 'User not found' });
      res.json({ user: { id: user.id, email: user.email, role: user.role } });
    } catch (err) {
      console.error('Auth me error:', err);
      res.status(401).json({ error: 'Invalid token' });
    }
  });

  // Additional useful routes
  app.get("/api/health", (_req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.PLATFORM_VERSION || "1.0.0"
    });
  });

  app.get("/api/status", (_req, res) => {
    res.json({ 
      message: "PromoHive API is running",
      database: prisma ? "connected" : "not connected",
      environment: process.env.NODE_ENV || "development"
    });
  });

  // New Authentication Routes
  app.post("/api/auth/register", register);
  app.post("/api/auth/login", login);
  app.get("/api/auth/verify-email", verifyEmail);

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
