import type { Request, Response } from "express";
import { app, ensureReady } from "../server";

let ready: Promise<void> | null = null;

export default async function handler(req: Request, res: Response) {
  try {
    if (!ready) {
      ready = ensureReady();
    }
    await ready;
  } catch (e: any) {
    res.status(500).json({ status: "error", error: e?.message || "Falha ao iniciar banco de dados" });
    return;
  }
  return app(req, res);
}
