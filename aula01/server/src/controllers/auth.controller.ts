import { Request, Response } from "express";
import { loginSchema } from "../schemas/login.schema";
import db from "../controllers/db";


export async function loginController(
  req: Request,
  res: Response
): Promise<void> {
  try {
    const validatedData = loginSchema.parse(req.body);
    const { username, password } = validatedData;

    const query = `SELECT * FROM users WHERE username = $1 AND password = $2`;
    const result = await db.query(query, [username, password]);

    if (result.rowCount !== 0) {
      res.status(200).json({ message: "Login realizado com sucesso!" });
    } else {
      res.status(401).json({ message: "Usuário ou senha inválidos" });
    }
  } catch (error: any) {
    if (error.errors) {
      res.status(400).json({ errors: error.errors });
    } else {
      res.status(500).json({ message: "Erro interno no servidor" });
    }
  }
}
