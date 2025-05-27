# Como iniciar o projeto OWASP Lab

Este guia descreve os comandos necessários para criar e configurar um projeto Node.js com TypeScript e Express.

## Passos

1. **Crie a pasta do projeto e acesse-a:**

   ```sh
   mkdir owasp-lab
   cd owasp-lab

   ```

2. Inicie um novo projeto Node.js:
   npm init -y

3. Instale as dependências de desenvolvimento:
   npm install typescript ts-node @types/node --save-dev

4. Instale o Express:
   npm install express @types/express

5. Crie um arquivo de configuração do TypeScript:
   npx tsc --init

Observações:  
 O comando npx tsc --init cria o arquivo tsconfig.json com as configurações iniciais do TypeScript.
O Express será utilizado para criar APIs ou servidores HTTP.
Os tipos (@types/node e @types/express) garantem melhor suporte ao desenvolvimento em TypeScript.
Siga estes passos para configurar rapidamente seu ambiente de desenvolvimento. ```

### ✅ 5. Código do servidor — src/index.ts

ts
import express from 'express';

const app = express();
const port = 3000;

// Middleware: Body parser para JSON e form-urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rota GET
app.get('/', (\_req, res) => {
res.send('Hello from Express + TypeScript!');
});

// Rota POST
app.post('/data', (req, res) => {
console.log('Corpo recebido:', req.body);
res.json({ message: 'Dados recebidos com sucesso!', dados: req.body });
});

app.listen(port, () => {
console.log(`🚀 Servidor rodando em http://localhost:${port}`);
});

---

### ✅ 6. Atualize o package.json com script

json
"scripts": {
"dev": "ts-node src/index.ts"
}

---

### ✅ 7. Execute o servidor

bash
npm run dev

---

### ✅ Teste o body parser

Você pode usar o curl, Postman ou qualquer cliente HTTP:

bash
curl -X POST http://localhost:3000/data \
 -H "Content-Type: application/json" \
 -d '{"nome": "Otávio", "idade": 25}'

Resposta esperada:

json
{
"message": "Dados recebidos com sucesso!",
"dados": {
"nome": "Otávio",
"idade": 25
}
}
