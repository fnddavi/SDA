import express, { Request, Response } from "express";
import dotenv from "dotenv";
import db from "./db";

dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env

const app = express(); // Instancia a aplicação Express

const PORT = process.env.PORT || 3000; // Porta que será usada pelo servidor

// Middleware para permitir o uso de JSON no corpo das requisições
app.use(express.json());

// Inicia o servidor e escuta na porta definida
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

app.post("/login-inseguro", async function (req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Código vulnerável a SQL Injection
    const query = `SELECT * FROM users  
                   WHERE username = '${username}' AND password = '${password}'`;
    const result = await db.query(query);
    if (result.rowCount !== 0) {
      res.json({ message: "Login bem-sucedido" });
    } else {
      res.status(401).json({ message: "Usuário ou senha inválidos" });
    }
  } catch (e: any) {
    res.status(500).json({ message: "Erro no servidor" });
  }
});

app.post("/login-seguro", async function (req: Request, res: Response) {
  try {
    const { username, password } = req.body;

    // Consultas parâmetrizadas
    const query = `SELECT * FROM users WHERE username = $1 AND password = $2`;
    const result = await db.query(query, [username, password]);
    if (result.rowCount !== 0) {
      res.json({ message: "Login bem-sucedido" });
    } else {
      res.status(401).json({ message: "Usuário ou senha inválidos" });
    }
  } catch (e: any) {
    res.status(500).json({ message: "Erro no servidor" });
  }
});
app.use(function (req: Request, res: Response) {
  res.status(404).json({ message: "Rota não encontrada" });
});
