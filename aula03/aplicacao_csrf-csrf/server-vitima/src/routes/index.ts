import express, { Request, Response } from "express";
// @ts-ignore
const { doubleCsrf } = require("csrf-csrf");
import db from "./db";

const router = express.Router();

// Configuração do csrf-csrf para geração de token
const doubleCsrfUtilities = doubleCsrf({
  getSecret: () => process.env.CSRF_SECRET || "super-secret-key", // Em produção use uma chave secreta forte
  cookieName: "XSRF-TOKEN",
  cookieOptions: {
    httpOnly: false, // IMPORTANTE: false para permitir acesso via JavaScript (Double Submit Cookie)
    sameSite: "lax",
    secure: false // true em produção com HTTPS
  },
  getSessionIdentifier: (req: Request) => {
    // Função obrigatória na versão 4.0.3 - identifica a sessão do usuário
    return req.cookies?.user || "anonymous";
  }
});

// Extrair as funções do objeto retornado (nome correto na versão 4.0.3)
const { generateCsrfToken, doubleCsrfProtection } = doubleCsrfUtilities;

// Simula login e define cookie de autenticação
router.post("/login", async (req: Request, res: Response) => {
  const { username, password } = req.body;

  const result = await db.query(
    "SELECT id FROM users WHERE username = $1 AND password = $2",
    [username, password]
  );

  if (result.rows.length > 0) {
    // Definindo cookie de autenticação
    res.cookie("user", result.rows[0].id, {
      sameSite: "lax", // Protege contra CSRF
      secure: false, // true em produção com HTTPS
    });

    // Gerando token CSRF
    const csrfToken = generateCsrfToken(req, res);
    // Enviando o token também no JSON
    res.json({ message: "Login efetuado com sucesso!", csrfToken });
  } else {
    res.status(401).json({ error: "Credenciais inválidas" });
  }
});

// Rota agora PROTEGIDA contra CSRF usando csrf-csrf
// http://atacante.local:3002/csrf-get-attack (será bloqueado)
router.post("/contact", doubleCsrfProtection, async (req: Request, res: Response) => {
  const { name, phone } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
  } else if (!name || !phone) {
    res.status(400).json({ error: "Nome e telefone são necessários" });
  } else {
    console.log(
      `Registrando contato: ${name}, ${phone} para o usuário: ${user}`
    );
    await db.query(
      "INSERT INTO contacts(user_id, name, phone) VALUES($1,$2,$3)",
      [user, name, phone]
    );

    res.json({ message: "Contato registrado com sucesso" });
  }
});

// Rota protegida com CSRF usando csrf-csrf
// Teste rodando em outro servidor, por exemplo:
// http://atacante.local:3002/csrf-post-attack
router.post("/change-password", doubleCsrfProtection, async (req: Request, res: Response) => {
  const { password } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
  } else if (!password) {
    res.status(400).json({ error: "Senha não fornecida" });
  } else {
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      password,
      user,
    ]);

    res.json({ message: "Senha alterada com sucesso" });
  }
});

// http://atacante.local:3002/csrf-post-attack-seguro
router.post("/change-password-segura", async (req: Request, res: Response) => {
  if (!req.headers.origin?.startsWith("http://vitima.local:3001")) {
    res.status(403).json({ error: "Requisição inválida" });
  } else {
    const { password } = req.body;
    const user = req.cookies.user;

    if (!user) {
      res.status(401).json({ error: "Usuário não autenticado" });
    } else if (!password) {
      res.status(400).json({ error: "Senha não fornecida" });
    } else {
      await db.query("UPDATE users SET password = $1 WHERE id = $2", [
        password,
        user,
      ]);

      res.json({ message: "Senha alterada com sucesso" });
    }
  }
});

// Parte da resposta do Exercício 3
router.post("/change-password-exer03", async (req: Request, res: Response) => {
  const { password, currentPassword } = req.body;
  const user = req.cookies.user;

  if (!user) {
    res.status(401).json({ error: "Usuário não autenticado" });
  } else if (!password || !currentPassword) {
    res.status(400).json({ error: "Preencha todos os campos" });
  } else {
    const result = await db.query(
      "SELECT * FROM users WHERE id = $1 AND password = $2",
      [user, currentPassword]
    );

    if (result.rows.length === 0) {
      res.status(403).json({ error: "Senha atual incorreta" });
    } else {
      await db.query(
        "UPDATE users SET password = $1 WHERE id = $2", 
        [password,user]
      );

      res.json({ message: "Senha alterada com sucesso" });
    }
  }
});

export default router;
