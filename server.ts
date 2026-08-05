import express from "express";
import { PrismaClient } from "./src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { MercadoPagoConfig, Preference, Payment as MPPayment } from "mercadopago";

// Removemos qualquer leitura de PRISMA_DATABASE_URL para forçar a usar a Neon,
// mesmo que o Vercel tenha variáveis velhas do Prisma Accelerate configuradas.
const rawDatabaseUrl = process.env.POSTGRES_URL || process.env.DATABASE_URL;

// O driver "pg" (usado pelo @prisma/adapter-pg) não reconhece o parâmetro
// "channel_binding", que a Neon/Vercel adicionam por padrão às connection
// strings. Deixar esse parâmetro na URL pode fazer a conexão falhar de forma
// não tratada logo na inicialização, derrubando toda a função serverless
// (FUNCTION_INVOCATION_FAILED) antes de qualquer try/catch conseguir atuar.
function sanitizeConnectionString(url: string): string {
  try {
    const parsed = new URL(url);
    parsed.searchParams.delete("channel_binding");
    return parsed.toString();
  } catch {
    return url;
  }
}

const databaseUrl = rawDatabaseUrl ? sanitizeConnectionString(rawDatabaseUrl) : undefined;

let prisma: PrismaClient | null = null;
if (databaseUrl) {
  try {
    const adapter = new PrismaPg({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false },
    } as any);
    prisma = new PrismaClient({ adapter } as any);
  } catch (e) {
    console.error("Falha ao inicializar o Prisma Client:", e);
    prisma = null;
  }
} else {
  console.error("DATABASE_URL não configurada. Defina a URL do banco PostgreSQL no .env");
}

async function dropLegacyTables() {
  const cols: any[] = await prisma!.$queryRawUnsafe(
    `SELECT column_name FROM information_schema.columns WHERE table_name = 'Admin'`
  );
  const hasLegacyAdmin = cols.length > 0 && !cols.some((c) => c.column_name === "username");
  if (hasLegacyAdmin) {
    console.log("Schema legado detectado; recriando tabelas...");
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "payment_receipts" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "payments" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "members" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "expenses" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "app_settings" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "Admin" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "Member" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "Payment" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "Expense" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "PaymentReceipt" CASCADE`);
    await prisma!.$executeRawUnsafe(`DROP TABLE IF EXISTS "AppSettings" CASCADE`);
  }
}

async function initDatabase() {
  await dropLegacyTables();
  await prisma!.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "Admin" ("id" TEXT NOT NULL PRIMARY KEY, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "name" TEXT NOT NULL)`);
  await prisma!.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "Admin_username_key" ON "Admin"("username")`);
  await prisma!.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "members" ("id" TEXT NOT NULL PRIMARY KEY, "name" TEXT NOT NULL, "username" TEXT NOT NULL, "password" TEXT NOT NULL, "phone" TEXT NOT NULL DEFAULT '', "whatsapp" TEXT NOT NULL, "birth_date" TEXT NOT NULL DEFAULT '', "entry_date" TEXT NOT NULL DEFAULT '', "monthly_fee" REAL NOT NULL, "due_date" INTEGER NOT NULL, "status" TEXT NOT NULL DEFAULT 'Ativo', "observations" TEXT NOT NULL DEFAULT '', "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL)`);
  await prisma!.$executeRawUnsafe(`CREATE UNIQUE INDEX IF NOT EXISTS "members_username_key" ON "members"("username")`);
  await prisma!.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "payments" ("id" TEXT NOT NULL PRIMARY KEY, "member_id" TEXT NOT NULL, "month" TEXT NOT NULL, "payment_date" TEXT, "amount" REAL NOT NULL, "method" TEXT, "status" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "payments_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
  await prisma!.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "payment_receipts" ("id" TEXT NOT NULL PRIMARY KEY, "payment_id" TEXT NOT NULL, "member_id" TEXT NOT NULL, "description" TEXT NOT NULL, "amount" REAL NOT NULL, "paid_at" TEXT NOT NULL, "status" TEXT NOT NULL DEFAULT 'Pendente', "reviewed_by" TEXT, "reviewed_at" TEXT, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL, CONSTRAINT "payment_receipts_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments" ("id") ON DELETE CASCADE ON UPDATE CASCADE, CONSTRAINT "payment_receipts_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "members" ("id") ON DELETE CASCADE ON UPDATE CASCADE)`);
  await prisma!.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "expenses" ("id" TEXT NOT NULL PRIMARY KEY, "description" TEXT NOT NULL, "amount" REAL NOT NULL, "date" TEXT NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL)`);
  await prisma!.$executeRawUnsafe(`CREATE TABLE IF NOT EXISTS "app_settings" ("id" TEXT NOT NULL PRIMARY KEY, "pix_key" TEXT NOT NULL DEFAULT '', "bank_name" TEXT NOT NULL DEFAULT '', "account_name" TEXT NOT NULL DEFAULT '', "default_monthly_fee" REAL NOT NULL DEFAULT 50, "default_due_date" INTEGER NOT NULL DEFAULT 10, "house_guidelines" TEXT NOT NULL DEFAULT '', "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP, "updated_at" TIMESTAMP NOT NULL)`);
}

async function seed() {
  await prisma!.admin.upsert({
    where: { username: "admin" },
    update: { password: "admin123", name: "Administrador" },
    create: { id: "admin-1", username: "admin", password: "admin123", name: "Administrador" },
  });
  console.log("Admin garantido: admin / admin123");
}

export const app = express();

// Health check
app.get("/api/health", async (_req, res) => {
  if (!prisma) {
    return res.status(500).json({ status: "error", db: "postgres", connected: false, error: "DATABASE_URL ausente" });
  }
  try {
    const adminCount = await prisma.admin.count();
    res.json({ status: "ok", db: "postgres", adminCount, connected: true });
  } catch (e: any) {
    res.status(500).json({ status: "error", db: "postgres", connected: false, error: e.message });
  }
});

// ─── Auth ──────────────────────────────────────────────────
app.post("/api/auth/admin", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const password = (req.body.password || "").trim();
    
    if (!username || !password) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const admins = await prisma!.admin.findMany();
    const admin = admins.find(a => a.username.toLowerCase() === username.toLowerCase());
    
    if (!admin || admin.password !== password) {
      return res.status(401).json({ 
        error: `Credenciais inválidas (Debug: found=${!!admin}, db_pass=${admin?.password}, req_pass=${password})`
      });
    }
    res.json({ id: admin.id, name: admin.name, username: admin.username });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/auth/member", async (req, res) => {
  try {
    const username = (req.body.username || "").trim();
    const password = (req.body.password || "").trim();

    if (!username || !password) {
      return res.status(401).json({ error: "Credenciais inválidas" });
    }

    const members = await prisma!.member.findMany();
    const member = members.find(m => m.username.toLowerCase() === username.toLowerCase());
    
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

// ─── Convite público (sem autenticação) ────────────────────
app.post("/api/members/convite", async (req, res) => {
  try {
    const { name, phone, whatsapp, birthDate } = req.body;
    if (!name || !whatsapp) {
      return res.status(400).json({ error: "Nome e WhatsApp são obrigatórios" });
    }

    // Gera username a partir do nome (sem acentos, lowercase, sem espaços)
    const baseUsername = name
      .toLowerCase()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, ".");

    // Garante unicidade do username
    const existing = await prisma!.member.findMany({ where: { username: { startsWith: baseUsername } } });
    const username = existing.length > 0 ? `${baseUsername}${existing.length}` : baseUsername;

    const member = await prisma!.member.create({
      data: {
        name,
        username,
        password: "mudar123", // senha temporária — admin deve alterar
        phone: phone || "",
        whatsapp,
        birthDate: birthDate || "",
        entryDate: new Date().toISOString().split("T")[0],
        monthlyFee: 50,
        dueDate: 10,
        status: "Pendente" as any,
        observations: "Cadastro via link de convite — aguardando aprovação",
      },
    });

    res.json({ ok: true, username, id: member.id });
  } catch (e: any) {
    console.error("Erro convite:", e);
    res.status(500).json({ error: e.message });
  }
});

// ─── Members ───────────────────────────────────────────────
app.get("/api/members", async (_req, res) => {
  try {
    const members = await prisma!.member.findMany({ orderBy: { createdAt: "desc" } });
    res.json(members);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/members", async (req, res) => {
  try {
    const member = await prisma!.member.create({ data: req.body });
    res.json(member);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/members/:id", async (req, res) => {
  try {
    const member = await prisma!.member.update({
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
    await prisma!.member.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Payments ──────────────────────────────────────────────
app.get("/api/payments", async (_req, res) => {
  try {
    const payments = await prisma!.payment.findMany({ orderBy: { createdAt: "desc" } });
    res.json(payments);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/payments", async (req, res) => {
  try {
    const payment = await prisma!.payment.create({ data: req.body });
    res.json(payment);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/payments/:id", async (req, res) => {
  try {
    const payment = await prisma!.payment.update({
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
    await prisma!.payment.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Mercado Pago — movimentações da conta ─────────────────
app.get("/api/mp/transactions", async (_req, res) => {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: "Mercado Pago não configurado (Access Token ausente)" });
    }

    // Busca os últimos 50 pagamentos da conta no MP
    const response = await fetch(
      "https://api.mercadopago.com/v1/payments/search?sort=date_created&criteria=desc&range=date_created&begin_date=NOW-3MONTHS&end_date=NOW&limit=50",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return res.status(response.status).json({ error: err.message || "Erro ao consultar Mercado Pago" });
    }

    const data = await response.json();
    const transactions = (data.results || []).map((p: any) => ({
      id: String(p.id),
      date_created: p.date_created,
      description: p.description || p.additional_info?.items?.[0]?.title || null,
      amount: p.transaction_amount,
      type: "income",
      status: p.status,
    }));

    res.json(transactions);
  } catch (e: any) {
    console.error("Erro MP transactions:", e);
    res.status(500).json({ error: e.message || "Erro ao buscar movimentações" });
  }
});

// ─── Mercado Pago — gerar link de pagamento ────────────────
app.post("/api/payments/:id/mercadopago", async (req, res) => {
  try {
    const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
    if (!accessToken) {
      return res.status(500).json({ error: "Mercado Pago não configurado (Access Token ausente)" });
    }

    const payment = await prisma!.payment.findUnique({
      where: { id: req.params.id },
      include: { member: true },
    });

    if (!payment) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }

    const client = new MercadoPagoConfig({ accessToken, options: { timeout: 5000 } });
    const preference = new Preference(client);

    const pref = await preference.create({
      body: {
        items: [
          {
            id: payment.id,
            title: `Mensalidade ${payment.month} - ${payment.member.name}`,
            quantity: 1,
            unit_price: payment.amount,
            currency_id: "BRL",
          },
        ],
        external_reference: payment.id,
        back_urls: {
          success: `${process.env.APP_URL || 'http://localhost:3000'}/members/${payment.memberId}`,
          failure: `${process.env.APP_URL || 'http://localhost:3000'}/members/${payment.memberId}`,
          pending: `${process.env.APP_URL || 'http://localhost:3000'}/members/${payment.memberId}`,
        },
        auto_return: "approved",
        notification_url: `${process.env.APP_URL || 'http://localhost:3000'}/api/webhooks/mercadopago`,
      },
    });

    res.json({ init_point: pref.init_point });
  } catch (e: any) {
    console.error("Erro MP:", e);
    res.status(500).json({ error: e.message || "Erro ao gerar link do Mercado Pago" });
  }
});

app.post("/api/webhooks/mercadopago", async (req, res) => {
  try {
    // Mercado pago envia notificações no formato: { action: "payment.updated", data: { id: "123" } }
    // ou { type: "payment", data: { id: "123" } }
    const { action, type, data } = req.body;
    
    const paymentId = data?.id;
    const notificationType = action || type;

    if (paymentId && (notificationType === "payment.updated" || notificationType === "payment.created" || notificationType === "payment")) {
      const accessToken = process.env.MERCADOPAGO_ACCESS_TOKEN;
      if (accessToken) {
        const client = new MercadoPagoConfig({ accessToken });
        const mpPayment = new MPPayment(client);
        const paymentInfo = await mpPayment.get({ id: paymentId });

        if (paymentInfo.status === "approved" && paymentInfo.external_reference) {
          await prisma!.payment.update({
            where: { id: paymentInfo.external_reference },
            data: {
              status: "Pago",
              method: paymentInfo.payment_method_id || "Mercado Pago",
              paymentDate: new Date().toISOString(),
            },
          });
        }
      }
    }
    res.status(200).send("OK");
  } catch (e: any) {
    console.error("Erro Webhook MP:", e);
    res.status(500).send("Error");
  }
});

// ─── Expenses ──────────────────────────────────────────────
app.get("/api/expenses", async (_req, res) => {
  try {
    const expenses = await prisma!.expense.findMany({ orderBy: { createdAt: "desc" } });
    res.json(expenses);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.post("/api/expenses", async (req, res) => {
  try {
    const expense = await prisma!.expense.create({ data: req.body });
    res.json(expense);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.delete("/api/expenses/:id", async (req, res) => {
  try {
    await prisma!.expense.delete({ where: { id: req.params.id } });
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// ─── Payment Receipts ──────────────────────────────────────
app.get("/api/receipts", async (_req, res) => {
  try {
    const receipts = await prisma!.paymentReceipt.findMany({ orderBy: { createdAt: "desc" } });
    res.json(receipts);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.get("/api/receipts/pending", async (_req, res) => {
  try {
    const receipts = await prisma!.paymentReceipt.findMany({
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
    const receipt = await prisma!.paymentReceipt.create({ data: req.body });
    res.json(receipt);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

app.put("/api/receipts/:id/approve", async (req, res) => {
  try {
    const { reviewedBy } = req.body;
    const receipt = await prisma!.paymentReceipt.update({
      where: { id: req.params.id },
      data: {
        status: "Aprovado",
        reviewedBy: reviewedBy || "Admin",
        reviewedAt: new Date().toISOString(),
      },
    });

    // Update the related payment to "Pago"
    await prisma!.payment.update({
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
    const receipt = await prisma!.paymentReceipt.update({
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
    let settings = await prisma!.appSettings.findFirst();
    if (!settings) {
      settings = await prisma!.appSettings.create({
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
    let settings = await prisma!.appSettings.findFirst();
    if (!settings) {
      settings = await prisma!.appSettings.create({ data: req.body });
    } else {
      settings = await prisma!.appSettings.update({
        where: { id: settings.id },
        data: req.body,
      });
    }
    res.json(settings);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

let readyPromise: Promise<void> | null = null;
export function ensureReady(): Promise<void> {
  if (!readyPromise) {
    readyPromise = (async () => {
      await initDatabase();
      await seed();
    })().catch((e) => {
      readyPromise = null;
      throw e;
    });
  }
  return readyPromise;
}
