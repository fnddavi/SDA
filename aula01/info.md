# 🧱 Início do Projeto - Node.js + Express + TypeScript + PostgreSQL

Este guia cobre os primeiros passos para configurar o servidor Node.js com TypeScript, usando Express e conectando ao banco PostgreSQL via pgAdmin.

---

## 📦 Pré-requisitos

- Node.js instalado
- PostgreSQL instalado
- pgAdmin configurado
- VS Code recomendado

---

## 🛠️ Criando o Banco de Dados no pgAdmin

1. Criar um novo banco de dados com nome `bdaula` (ou outro de sua preferência)
2. Executar os comandos abaixo para criação da tabela `users` com dados de teste:

```sql
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR NOT NULL,
  password VARCHAR NOT NULL
);

INSERT INTO users (username, password) VALUES
  ('admin', '123'),
  ('root', 'abc');
```

---

## 🚀 Configuração do Servidor Node.js

### 1. Criar a pasta do projeto

```bash
mkdir server
cd server
```

### 2. Inicializar o projeto Node.js

```bash
npm init -y
```

### 3. Instalar dependências principais

```bash
npm i express
npm i pg
npm i dotenv
```

### 4. Instalar definições de tipos (TypeScript + Express + PostgreSQL)

```bash
npm i typescript ts-node ts-node-dev -D
npm i @types/express -D
npm i @types/pg -D
```

### 5. Inicializar configuração do TypeScript

```bash
npx tsc --init
```

### 6. Adicionar scripts ao package.json

```json
"scripts": {
  "dev": "ts-node-dev ./src",
  "start": "ts-node ./src"
}
```

### 7. Criar arquivo .env na raiz do projeto

```env
PORT=3001
BD_HOST=localhost
BD_USER=postgres
BD_PASSWORD=123
BD_DATABASE=bdaula
BD_PORT=5432
```

---

## 📂 Estrutura Inicial dos Arquivos

```text
server/
├── node_modules/
├── src/
│   ├── db.ts
│   └── index.ts
├── .env
├── package.json
└── tsconfig.json
```

---

## 🔗 Código de Conexão com o Banco (src/db.ts)

```typescript
import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

export default new Pool({
  host: process.env.BD_HOST,
  user: process.env.BD_USER,
  password: process.env.BD_PASSWORD,
  database: process.env.BD_DATABASE,
  port: Number(process.env.BD_PORT),
});
```

---

## 🌐 Servidor Express com rotas de login (src/index.ts)

```typescript
import express, { Request, Response } from "express";
import dotenv from "dotenv";
import db from "./db";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});

// Rota vulnerável
app.post("/login-inseguro", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;
  const result = await db.query(query);
  result.rowCount !== 0
    ? res.json({ message: "Login bem-sucedido" })
    : res.status(401).json({ message: "Usuário ou senha inválidos" });
});

// Rota segura
app.post("/login-seguro", async (req: Request, res: Response) => {
  const { username, password } = req.body;
  const query = `SELECT * FROM users WHERE username = $1 AND password = $2`;
  const result = await db.query(query, [username, password]);
  result.rowCount !== 0
    ? res.json({ message: "Login bem-sucedido" })
    : res.status(401).json({ message: "Usuário ou senha inválidos" });
});
```

---

## 🔧 Executar o Servidor

```bash
# Modo de desenvolvimento (com auto-reload)
npm run dev

# Modo de produção
npm start
```

---

## 📖 Notas Importantes

- A rota `/login-inseguro` é vulnerável a SQL Injection
- A rota `/login-seguro` usa parâmetros preparados (query parameterizada)
- Sempre use variáveis de ambiente para dados sensíveis
- Mantenha as dependências atualizadas