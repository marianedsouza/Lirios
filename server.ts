import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { PrismaClient } from "./src/generated/prisma";

const prisma = new PrismaClient();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
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

startServer();
