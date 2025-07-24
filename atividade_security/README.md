# Sistema de Cadastro Seguro

Um sistema de cadastro de usuários e gerenciamento de contatos pessoais com foco em segurança, implementando criptografia híbrida (RSA + AES), autenticação JWT e proteção de dados sensíveis.

## 🔐 Características de Segurança

- **Autenticação JWT** com tokens seguros
- **Criptografia híbrida (RSA + AES)** para comunicação cliente-servidor
- **Criptografia de dados sensíveis** em repouso no banco de dados
- **Hashing seguro de senhas** com bcrypt (12 rounds)
- **Rate limiting** para prevenir ataques de força bruta
- **Proteção CORS** configurada adequadamente
- **Helmet.js** para headers de segurança
- **Auditoria completa** de ações dos usuários
- **Validação rigorosa** de inputs

## 🏗️ Arquitetura

### Backend (Node.js + TypeScript)
- **Express.js** - Framework web
- **PostgreSQL** - Banco de dados relacional
- **JWT** - Autenticação stateless
- **bcrypt** - Hash de senhas
- **crypto-js + node-rsa** - Criptografia híbrida
- **Helmet + CORS** - Segurança HTTP

### Frontend (Vanilla JavaScript)
- **HTML5 + CSS3** - Interface responsiva
- **JavaScript ES6+** - Lógica do cliente
- **Crypto-js** - Criptografia no navegador
- **Font Awesome** - Ícones

### Banco de Dados
- **PostgreSQL** com extensão UUID
- **Dados criptografados** em colunas específicas
- **Índices otimizados** para performance
- **Triggers automáticos** para updated_at
- **Logs de auditoria** completos

## 📋 Pré-requisitos

- Node.js 16+ 
- PostgreSQL 12+
- npm ou yarn

## 🚀 Instalação e Configuração

### 1. Clone e instale dependências
```bash
git clone <repo-url>
cd atividade_security
npm install
```

### 2. Configure o banco PostgreSQL
```bash
# Crie o banco de dados
createdb security_app

# Ou usando psql
psql -U postgres -c "CREATE DATABASE security_app;"

# Execute o script de criação das tabelas
npm run db:setup
```

### 3. Configure as variáveis de ambiente
Copie o arquivo `.env` e ajuste as configurações:

```bash
# Configuração do banco
DB_HOST=localhost
DB_PORT=5432
DB_NAME=security_app
DB_USER=postgres
DB_PASSWORD=sua_senha

# Chaves de segurança
JWT_SECRET=sua_chave_jwt_super_secreta_aqui
AES_KEY=sua_chave_aes_256_bits_em_hex
```

### 4. Execute a aplicação

#### Desenvolvimento
```bash
npm run dev
```

#### Produção
```bash
npm run build
npm start
```

A aplicação estará disponível em `http://localhost:3000`

## 📚 Endpoints da API

### Autenticação
- `POST /api/auth/register` - Registro de usuário
- `POST /api/auth/login` - Login
- `GET /api/auth/verify-token` - Verificar token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/public-key/:userId` - Obter chave pública
- `POST /api/auth/decrypt-hybrid` - Descriptografar dados

### Contatos
- `GET /api/contacts` - Listar contatos
- `POST /api/contacts` - Criar contato
- `GET /api/contacts/:id` - Buscar contato
- `PUT /api/contacts/:id` - Atualizar contato
- `DELETE /api/contacts/:id` - Remover contato
- `GET /api/contacts/search?q=termo` - Buscar contatos
- `GET /api/contacts/stats` - Estatísticas

## 🔒 Fluxo de Criptografia

### 1. Registro de Usuário
- Senha hasheada com bcrypt (12 rounds)
- Nome completo criptografado com AES-256
- Par de chaves RSA gerado automaticamente
- Chave privada criptografada e armazenada

### 2. Comunicação Híbrida
- Cliente obtém chave pública RSA do usuário
- Dados sensíveis criptografados com AES (chave de sessão)
- Chave AES criptografada com RSA
- Servidor descriptografa usando chave privada

### 3. Armazenamento Seguro
- Dados pessoais criptografados com AES-256-GCM
- Senhas hasheadas com bcrypt
- Chaves privadas criptografadas em repouso
- Logs de auditoria para rastreabilidade

## 🛡️ Medidas de Segurança Implementadas

### Autenticação e Autorização
- JWT com expiração configurável
- Verificação de usuário ativo a cada requisição
- Rate limiting por IP (customizável por endpoint)
- Middleware de autorização para recursos próprios

### Criptografia
- **RSA-2048** para troca de chaves
- **AES-256-GCM** para dados em trânsito e repouso
- **bcrypt** com 12 rounds para senhas
- **SHA-256** para hashes auxiliares

### Proteção Web
- Headers de segurança via Helmet.js
- CORS configurado adequadamente
- CSP (Content Security Policy)
- Prevenção de XSS e CSRF

### Auditoria e Monitoramento
- Log de todas as ações dos usuários
- Detecção de tentativas de acesso não autorizado
- Rate limiting com logs de violações
- Timestamps precisos para todas as operações

## 📝 Estrutura do Projeto

```
atividade_security/
├── src/                          # Código fonte TypeScript
│   ├── controllers/              # Controladores da API
│   ├── middleware/               # Middlewares (auth, rate limit, etc.)
│   ├── models/                   # Modelos de dados e tipos
│   ├── routes/                   # Definição das rotas
│   ├── utils/                    # Utilitários (crypto, database, audit)
│   └── server.ts                 # Servidor principal
├── public/                       # Frontend estático
│   ├── styles/                   # CSS
│   ├── scripts/                  # JavaScript do cliente
│   └── index.html                # Página principal
├── sql/                          # Scripts SQL
│   └── create_tables.sql         # Criação das tabelas
├── .env                          # Variáveis de ambiente
├── tsconfig.json                 # Configuração TypeScript
└── package.json                  # Dependências e scripts
```

## 🧪 Teste da Aplicação

### Funcionalidades Principais

1. **Registro**: Crie uma conta com dados pessoais
2. **Login**: Entre com suas credenciais
3. **Contatos**: Adicione, edite e remova contatos
4. **Busca**: Procure contatos por nome
5. **Segurança**: Todos os dados são criptografados

### Cenários de Teste

- Registro com validação de senha forte
- Login com rate limiting
- CRUD completo de contatos
- Busca e filtros
- Logout e invalidação de sessão

## 📊 Auditoria e Logs

O sistema registra automaticamente:

- Tentativas de login (sucessos e falhas)
- Criação, edição e remoção de contatos
- Tentativas de acesso não autorizado
- Operações de criptografia
- Rate limiting violations

Acesse os logs via queries SQL na tabela `audit_logs`.

## 🔧 Configurações Avançadas

### Rate Limiting
```typescript
// Configuração personalizada por endpoint
const authRateLimit = rateLimitByIP(20, 15); // 20 req/15min
const contactRateLimit = rateLimitByIP(200, 15); // 200 req/15min
```

### Criptografia
```typescript
// Chaves podem ser rotacionadas
const aesKey = process.env.AES_KEY; // 32 bytes hex
const rsaKeySize = 2048; // bits
```

## 🚨 Considerações de Segurança

⚠️ **IMPORTANTE**: Este é um projeto educacional. Para produção:

1. Use HTTPS obrigatório
2. Configure firewall adequado
3. Monitore logs regularmente
4. Implemente backup criptografado
5. Mantenha dependências atualizadas
6. Use certificados SSL válidos
7. Configure WAF se necessário

## 📄 Licença

Este projeto é apenas para fins educacionais.

## 👥 Contribuição

Este é um projeto acadêmico. Sugestões de melhorias são bem-vindas!

---

**Desenvolvido para demonstrar implementação de segurança em aplicações web** 🔐
