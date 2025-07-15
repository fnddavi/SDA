import express, { Request, Response } from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./db";
import path from "path";
import sanitizeHtml from "sanitize-html";
import cookieParser from "cookie-parser";

// Carrega as variáveis de ambiente definidas no arquivo .env
dotenv.config();

// Inicializa a aplicação Express
const app = express();

// Define a porta utilizada pelo servidor
const PORT = process.env.PORT || 3000;

// Middleware para permitir o envio de dados em formato JSON no corpo das requisições
app.use(express.json());

// Middleware para habilitar requisições de diferentes origens (CORS)
app.use(cors());

// Middleware que interpreta cookies enviados nas requisições HTTP.
// Isso possibilita o acesso aos cookies através de `req.cookies`.
app.use(cookieParser());

// Middleware para servir arquivos estáticos a partir do diretório "public"
app.use(express.static("public"));

// Inicializa o servidor na porta definida
app.listen(PORT, function () {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});


// ****** ROTAS PARA PÁGINAS HTML ESTÁTICAS ******
app.get("/stored-xss", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "stored-xss.html"));
});

app.get("/dom-xss", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "dom-based-xss.html"));
});

app.get("/dom-xss-sanitize", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "dom-based-xss-sanitize.html"));
});

app.get("/exercicio1-vulneravel", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "exercicio1-vulneravel.html"));
});

app.get("/exercicio1-resposta", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "exercicio1-resposta.html"));
});

app.get("/exercicio2-vulneravel", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "exercicio2-vulneravel.html"));
});

app.get("/exercicio2-resposta", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "exercicio2-resposta.html"));
});

app.get("/exercicio3-resposta", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "exercicio3-resposta.html"));
});

app.get("/exercicio4-vulneravel", (_: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "..", "public", "exercicio4-vulneravel.html"));
});


// ****** STORED XSS ******

// Rota para inserir comentário vulnerável (sem sanitização)
app.post("/comment", (req: Request, res: Response) => {
  const comment = req.body.comment;
  db.query("INSERT INTO comments (text) VALUES ($1)", [comment]);
  res.json({ message: "Comentário adicionado!" });
});

// Rota para exibir comentários armazenados (potencialmente maliciosos)
app.get("/comments", async (req: Request, res: Response) => {
  const result = await db.query("SELECT text FROM comments");
  res.header("Content-Type", "text/html");
  res.send(result.rows.map((row) => `<div>${row.text}</div>`).join(""));
});

// Rota para inserir comentário com sanitização
app.post("/comment-sanitize", (req: Request, res: Response) => {
  const comment = req.body.comment;

  // Remove todas as tags HTML e atributos
  const sanitizedComment = sanitizeHtml(comment, {
    allowedTags: [],
    allowedAttributes: {},
  });

  db.query("INSERT INTO comments_sanitize (text) VALUES ($1)", [sanitizedComment]);
  res.json({ message: "Comentário adicionado com segurança!" });
});

// Rota para exibir comentários sanitizados
app.get("/comments-sanitize", async (req: Request, res: Response) => {
  const result = await db.query("SELECT text FROM comments_sanitize");
  res.header("Content-Type", "text/html");
  res.send(result.rows.map((row) => `<div>${row.text}</div>`).join(""));
});


// ****** REFLECTED XSS ******

// Rota vulnerável que reflete diretamente o valor da query string na resposta
app.get("/search", (req: Request, res: Response) => {
  const input = req.query.q;
  res.send(`
    <html>
      <body>
        <h3>Resultados da busca:</h3>
        <p>Você pesquisou por: ${input}</p>
      </body>
    </html>
  `);
});

// Rota com sanitização contra Reflected XSS
app.get("/search-sanitize", (req: Request, res: Response) => {
  const input = req.query.q as string;

  const sanitizedInput = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });

  res.send(`
    <html>
      <body>
        <h3>Resultados da busca:</h3>
        <p>Você pesquisou por: ${sanitizedInput}</p>
      </body>
    </html>
  `);
});


// EXERCÍCIO 1 – Rota para simular o recebimento de um cookie roubado
app.get("/exercicio1-server", (req: Request, res: Response) => {
  const response = req.query.c as string;
  console.log("Cookie capturado:", response);
  res.send(""); // Resposta vazia
});

// EXERCÍCIO 2 – Inserção e listagem de perfis com vulnerabilidade a XSS
// Rota para inserir dados no banco sem sanitização
app.post("/exercicio2", (req: Request, res: Response) => {
  const { name, description } = req.body;
  db.query("INSERT INTO profiles (name, description) VALUES ($1, $2)", [name, description]);
  res.json({ message: "Perfil criado!" });
});

// Rota para listar os dados inseridos
app.get("/exercicio2", async (req: Request, res: Response) => {
  const result = await db.query("SELECT name, description FROM profiles");
  res.json(result.rows);
});

// EXERCÍCIO 3 – Simulação de envio de cookie HttpOnly (inalcançável via JavaScript)
app.get("/exercicio3-login", (req: Request, res: Response) => {
  res.cookie("exer03", "exer03servidor", {
    httpOnly: true,        // Inacessível via JavaScript
    path: "/",
    sameSite: "strict",    // Impede envio entre sites diferentes
    secure: false          // Deve ser true em produção com HTTPS
  });
  res.send({ mensagem: "Cookie HttpOnly enviado com sucesso." });
});
