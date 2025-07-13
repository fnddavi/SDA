import { Request, Response } from "express";
import { ZodError } from "zod";
import { loginSchema } from "../schemas/login.schema";
import db from "./db";
import bcrypt from "bcrypt";
import { logSuspicious } from "../utils/logger";

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { username, password } = validatedData;

    if (!password) {
      logSuspicious({ ip: req.ip ?? "unknown", username, reason: "Senha não fornecida" });
      res.status(400).json({ message: "Senha é obrigatória" });
      return;
    }

    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await db.query(query, [username]);

    const isSuspiciousUsername = /('|--|\bOR\b)/i.test(username);

    if (result.rowCount === 0) {
      logSuspicious({
        ip: req.ip ?? "unknown",
        username,
        reason: isSuspiciousUsername
          ? "Possível tentativa de SQL Injection"
          : "Usuário inexistente",
      });
      res.status(401).json({ message: "Usuário ou senha inválidos" });
      return;
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      logSuspicious({
        ip: req.ip ?? "unknown",
        username,
        reason: isSuspiciousUsername
          ? "Possível tentativa de SQL Injection"
          : "Senha incorreta",
      });
      res.status(401).json({ message: "Usuário ou senha inválidos" });
      return;
    }

    res.status(200).json({ message: "Login realizado com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      const username = req.body?.username || "desconhecido";
      logSuspicious({
        ip: req.ip ?? "unknown",
        username,
        reason: "Erro de validação",
      });
      res.status(400).json({ errors: error.issues });
    } else {
      console.error("Erro inesperado:", error);
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}
