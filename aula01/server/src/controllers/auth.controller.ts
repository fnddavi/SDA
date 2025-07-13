import { Request, Response } from "express";
import { ZodError } from "zod";
import { loginSchema } from "../schemas/login.schema";
import db from "./db";
import bcrypt from "bcrypt";

export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { username, password } = validatedData;

    // Verifica se o password foi fornecido
    if (!password) {
      res.status(400).json({ message: "Senha é obrigatória" });
      return;
    }

    const query = `SELECT * FROM users WHERE username = $1`;
    const result = await db.query(query, [username]);

    if (result.rowCount === 0) {
      res.status(401).json({ message: "Usuário ou senha inválidos" });
      return;
    }

    const user = result.rows[0];

    // Comparação segura com bcrypt
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      res.status(401).json({ message: "Usuário ou senha inválidos" });
      return;
    }

    res.status(200).json({ message: "Login realizado com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.issues });
    } else {
      console.error("Erro inesperado:", error);
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}

export async function registerController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { username, password } = validatedData;

    // Verifica se o password foi fornecido
    if (!password) {
      res.status(400).json({ message: "Senha é obrigatória para registro" });
      return;
    }

    // Verifica se o usuário já existe
    const existingUser = await db.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if ((existingUser.rowCount ?? 0) > 0) {
      res.status(409).json({ message: "Usuário já existe" });
      return;
    }

    // Gera o hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insere o usuário
    const insertQuery = `INSERT INTO users (username, password) VALUES ($1, $2)`;
    await db.query(insertQuery, [username, hashedPassword]);

    res.status(201).json({ message: "Usuário registrado com sucesso!" });
  } catch (error) {
    if (error instanceof ZodError) {
      res.status(400).json({ errors: error.issues });
    } else {
      console.error("Erro no registro:", error);
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}

