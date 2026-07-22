import "dotenv/config";
import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

const adapter = new PrismaLibSql({ url: `file:${path.join(process.cwd(), "dev.db")}` });
const prisma = new PrismaClient({ adapter });

async function initDatabase() {
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "admins" ("id" TEXT NOT NULL PRIMARY KEY, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "name" TEXT NOT NULL)`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "admins_username_key" ON "admins"("username")`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "members" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "phone" TEXT NOT NULL DEFAULT '', "whatsapp" TEXT NOT NULL, "birth_date" TEXT NOT NULL DEFAULT '', "entry_date" TEXT NOT NULL DEFAULT '', "monthly_fee" REAL NOT NULL, "due_date" INTEGER NOT NULL, "status" TEXT NOT NULL DEFAULT 'Ativo', "observations" TEXT NOT NULL DEFAULT '', "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL)`);
  await prisma.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "members_username_key" ON "members"("username")`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "payments" ("id" TEXT NOT NULL PRIMARY KEY, "member_id" TEXT NOT NULL, "month" TEXT NOT NULL, "payment_date" TEXT, "amount" REAL NOT NULL, "method" TEXT, "status" TEXT NOT NULL, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL, CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "payment_receipts" ("id" TEXT NOT NULL PRIMARY KEY, "payment_id" TEXT NOT NULL, "member_id" TEXT NOT NULL, "description" TEXT NOT NULL, "amount" REAL NOT NULL, "paid_at" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'Pendente', "reviewed_by" TEXT, "reviewed_at" TEXT, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL, CONSTRAINT "payment_receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "payment_receipts_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "expenses" ("id" TEXT NOT NULL PRIMARY KEY, "description" TEXT NOT NULL, "amount" REAL NOT NULL, "date" TEXT NOT NULL, "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL)`);
  await prisma.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "app_settings" ("id" TEXT NOT NULL PRIMARY KEY, "pix_key" TEXT NOT NULL DEFAULT '', "bank_name" TEXT NOT NULL DEFAULT '', "account_name" TEXT NOT NULL DEFAULT '', "default_monthly_fee" REAL NOT NULL DEFAULT 50, "default_due_date" INTEGER NOT NULL DEFAULT 10, "house_guidelines" TEXT NOT NULL DEFAULT '', "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" DATETIME NOT NULL)`);
}

async function seed() {
  const admin = await prisma.admin.findUnique({ where: { username: "admin" } });
  if (!admin) {
    await prisma.admin.create({
      data: { id: "admin-1", username: "admin", password: "admin123", name: "Administrador" },
    });
    console.log("Admin seed created: admin / admin123");
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  // ─── Auth ──────────────────────────────────────────────────
  app.post("/api/auth/admin", async (req, res) => {
    try {
      const { username, password } = req.body;
      const admin = await prisma.admin.findUnique({ where: { username } });
      if (!admin || admin.password !== password) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      res.json({ id: admin.id, name: admin.name, username: admin.username });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/auth/member", async (req, res) => {
    try {
      const { username, password } = req.body;
      const member = await prisma.member.findFirst({ where: { username } });
      if (!member || member.password !== password) {
        return res.status(401).json({ error: "Credenciais inválidas" });
      }
      if (member.status !== "Ativo") {
        return res.status(403).json({ error: "Conta inativa" });
      }
      res.json({ id: member.id, name: member.name });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Members ───────────────────────────────────────────────
  app.get("/api/members", async (_req, res) => {
    try {
      const members = await prisma.member.findMany({ orderBy: { createdAt: "desc" } });
      res.json(members);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/members", async (req, res) => {
    try {
      const member = await prisma.member.create({ data: req.body });
      res.json(member);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/members/:id", async (req, res) => {
    try {
      const member = await prisma.member.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(member);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/members/:id", async (req, res) => {
    try {
      await prisma.member.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Payments ──────────────────────────────────────────────
  app.get("/api/payments", async (_req, res) => {
    try {
      const payments = await prisma.payment.findMany({ orderBy: { createdAt: "desc" } });
      res.json(payments);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const payment = await prisma.payment.create({ data: req.body });
      res.json(payment);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/payments/:id", async (req, res) => {
    try {
      const payment = await prisma.payment.update({
        where: { id: req.params.id },
        data: req.body,
      });
      res.json(payment);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/payments/:id", async (req, res) => {
    try {
      await prisma.payment.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Expenses ──────────────────────────────────────────────
  app.get("/api/expenses", async (_req, res) => {
    try {
      const expenses = await prisma.expense.findMany({ orderBy: { createdAt: "desc" } });
      res.json(expenses);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/expenses", async (req, res) => {
    try {
      const expense = await prisma.expense.create({ data: req.body });
      res.json(expense);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      await prisma.expense.delete({ where: { id: req.params.id } });
      res.json({ ok: true });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Payment Receipts ──────────────────────────────────────
  app.get("/api/receipts", async (_req, res) => {
    try {
      const receipts = await prisma.paymentReceipt.findMany({ orderBy: { createdAt: "desc" } });
      res.json(receipts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.get("/api/receipts/pending", async (_req, res) => {
    try {
      const receipts = await prisma.paymentReceipt.findMany({
        where: { status: "Pendente" },
        orderBy: { createdAt: "desc" },
      });
      res.json(receipts);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.post("/api/receipts", async (req, res) => {
    try {
      const receipt = await prisma.paymentReceipt.create({ data: req.body });
      res.json(receipt);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/receipts/:id/approve", async (req, res) => {
    try {
      const { reviewedBy } = req.body;
      const receipt = await prisma.paymentReceipt.update({
        where: { id: req.params.id },
        data: {
          status: "Aprovado",
          reviewedBy: reviewedBy || "Admin",
          reviewedAt: new Date().toISOString(),
        },
      });

      // Update the related payment to "Pago"
      await prisma.payment.update({
        where: { id: receipt.paymentId },
        data: {
          status: "Pago",
          method: "PIX",
          paymentDate: receipt.paidAt,
        },
      });

      res.json(receipt);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/receipts/:id/reject", async (req, res) => {
    try {
      const { reviewedBy } = req.body;
      const receipt = await prisma.paymentReceipt.update({
        where: { id: req.params.id },
        data: {
          status: "Rejeitado",
          reviewedBy: reviewedBy || "Admin",
          reviewedAt: new Date().toISOString(),
        },
      });
      res.json(receipt);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Settings ──────────────────────────────────────────────
  app.get("/api/settings", async (_req, res) => {
    try {
      let settings = await prisma.appSettings.findFirst();
      if (!settings) {
        settings = await prisma.appSettings.create({
          data: {
            pixKey: "55292931829",
            bankName: "Nubank",
            accountName: "Hugo Daniel Ribeiro Nantes",
            defaultMonthlyFee: 50,
            defaultDueDate: 10,
            houseGuidelines: "",
          },
        });
      }
      res.json(settings);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  app.put("/api/settings", async (req, res) => {
    try {
      let settings = await prisma.appSettings.findFirst();
      if (!settings) {
        settings = await prisma.appSettings.create({ data: req.body });
      } else {
        settings = await prisma.appSettings.update({
          where: { id: settings.id },
          data: req.body,
        });
      }
      res.json(settings);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ─── Vite / Static ─────────────────────────────────────────
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

initDatabase().then(() => seed()).then(() => startServer());
