import "dotenv/config";
import path from "path";
import { createServer as createViteServer } from "vite";
import express from "express";
import { app, ensureReady } from "./server.js";

async function attachStatic() {
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
}

const isVercel = process.env.VERCEL === "1" || !!process.env.LAMBDA_TASK_ROOT;
if (!isVercel) {
  ensureReady()
    .then(() => attachStatic())
    .then(() => {
      const PORT = Number(process.env.PORT) || 3000;
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server running on http://localhost:${PORT}`);
      });
    })
    .catch((e) => {
      console.error("Falha ao iniciar servidor:", e);
      process.exit(1);
    });
}
