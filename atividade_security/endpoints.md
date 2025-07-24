# 🔐 Sistema de Contatos Seguros - Documentação da API

## 📋 Índice
- [Visão Geral](#visão-geral)
- [Configuração](#configuração)
- [Autenticação](#autenticação)
- [Endpoints](#endpoints)
- [Exemplos de Uso](#exemplos-de-uso)
- [Códigos de Resposta](#códigos-de-resposta)
- [Segurança](#segurança)

## 🎯 Visão Geral

Esta API REST foi desenvolvida para gerenciar contatos pessoais de forma segura, implementando:

- **Autenticação JWT** com tokens seguros
- **Criptografia AES-256-GCM** para dados sensíveis
- **Hash bcrypt** para senhas (12 rounds)
- **Rate limiting** para prevenção de ataques
- **Logs de auditoria** completos
- **Validação rigorosa** de entrada

### 🏗️ Tecnologias
- **Backend:** Node.js + TypeScript + Express.js
- **Banco de Dados:** PostgreSQL com criptografia
- **Autenticação:** JSON Web Tokens (JWT)
- **Criptografia:** AES-256-GCM + bcrypt
- **Segurança:** Helmet.js + CORS + Rate Limiting

---

## ⚙️ Configuração

### Base URL
```
http://localhost:3000
```

### Headers Obrigatórios
```http
Content-Type: application/json
Authorization: Bearer {token}  # Para rotas protegidas
```

---

## 🔐 Autenticação

### Fluxo de Autenticação
1. **Registrar** novo usuário → Recebe confirmação
2. **Login** com credenciais → Recebe JWT token
3. **Usar token** nas requisições protegidas

### Token JWT
- **Algoritmo:** HS256
- **Expiração:** 24 horas
- **Formato:** `Bearer {token}`

---

## 📡 Endpoints

### 👤 **Autenticação**

#### `POST /api/auth/register`
Registra um novo usuário no sistema.

**Request:**
```json
{
  "username": "usuario123",
  "fullName": "Nome Completo do Usuário",
  "email": "usuario@email.com",
  "password": "senha123456"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Usuário criado com sucesso",
  "data": {
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Validações:**
- Username: único, alfanumérico
- Email: formato válido, único
- Password: mínimo 8 caracteres
- FullName: obrigatório

---

#### `POST /api/auth/login`
Autentica usuário e retorna JWT token.

**Request:**
```json
{
  "email": "usuario@email.com",
  "password": "senha123456"
}
```

**Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "username": "usuario123",
    "email": "usuario@email.com",
    "fullName": "Nome Completo do Usuário",
    "created_at": "2025-07-24T00:00:00.000Z",
    "last_login": "2025-07-24T01:00:00.000Z"
  },
  "message": "Login realizado com sucesso"
}
```

---

### 👥 **Contatos**

> **⚠️ Todas as rotas de contatos requerem autenticação (Bearer token)**

#### `POST /api/contacts`
Cria um novo contato.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "João Silva",
  "email": "joao@empresa.com",
  "phone": "(11) 99999-1234",
  "company": "Tech Corp Ltda",
  "notes": "Cliente importante do setor financeiro"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "contactId": "660e8400-e29b-41d4-a716-446655440001"
  },
  "message": "Contato criado com sucesso"
}
```

**Validações:**
- Name: obrigatório, máximo 100 caracteres
- Email: formato válido, obrigatório
- Phone: obrigatório, formato brasileiro
- Company: opcional, máximo 100 caracteres
- Notes: opcional, máximo 500 caracteres

---

#### `GET /api/contacts`
Lista todos os contatos do usuário autenticado.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "name": "João Silva",
      "email": "joao@empresa.com",
      "phone": "(11) 99999-1234",
      "company": "Tech Corp Ltda",
      "notes": "Cliente importante do setor financeiro",
      "created_at": "2025-07-24T00:00:00.000Z",
      "updated_at": "2025-07-24T00:00:00.000Z"
    }
  ],
  "message": "1 contatos encontrados"
}
```

---

#### `GET /api/contacts/{id}`
Busca um contato específico por ID.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440001",
    "name": "João Silva",
    "email": "joao@empresa.com",
    "phone": "(11) 99999-1234",
    "company": "Tech Corp Ltda",
    "notes": "Cliente importante do setor financeiro",
    "created_at": "2025-07-24T00:00:00.000Z",
    "updated_at": "2025-07-24T00:00:00.000Z"
  }
}
```

---

#### `PUT /api/contacts/{id}`
Atualiza um contato existente.

**Headers:**
```
Authorization: Bearer {token}
Content-Type: application/json
```

**Request:**
```json
{
  "name": "João Silva Santos",
  "email": "joao.santos@empresa.com",
  "phone": "(11) 98888-5678",
  "company": "Tech Corp Ltda - Filial SP",
  "notes": "Cliente VIP - dados atualizados"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contato atualizado com sucesso"
}
```

---

#### `DELETE /api/contacts/{id}`
Remove um contato.

**Headers:**
```
Authorization: Bearer {token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Contato removido com sucesso"
}
```

---

## 🧪 Exemplos de Uso

### Fluxo Completo com cURL

#### 1. Registrar Usuário
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "fullName": "Usuario de Teste",
    "email": "teste@example.com",
    "password": "senha123456"
  }'
```

#### 2. Fazer Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "teste@example.com",
    "password": "senha123456"
  }'
```

#### 3. Criar Contato (usando token do login)
```bash
curl -X POST http://localhost:3000/api/contacts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Maria Santos",
    "email": "maria@empresa.com",
    "phone": "(11) 98765-4321",
    "company": "Design Studio",
    "notes": "Designer freelancer"
  }'
```

#### 4. Listar Contatos
```bash
curl -X GET http://localhost:3000/api/contacts \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

---

## 📊 Códigos de Resposta

| Código | Status | Descrição |
|--------|--------|-----------|
| `200` | ✅ OK | Requisição bem-sucedida |
| `201` | ✅ Created | Recurso criado com sucesso |
| `400` | ❌ Bad Request | Dados inválidos ou ausentes |
| `401` | ❌ Unauthorized | Token ausente ou inválido |
| `403` | ❌ Forbidden | Acesso negado |
| `404` | ❌ Not Found | Recurso não encontrado |
| `409` | ❌ Conflict | Conflito (email/username já existe) |
| `429` | ❌ Too Many Requests | Rate limit excedido |
| `500` | ❌ Internal Server Error | Erro interno do servidor |

### Estrutura de Erro Padrão
```json
{
  "success": false,
  "error": "Descrição do erro"
}
```

---

## 🔒 Segurança

### Medidas Implementadas

#### 1. **Criptografia de Dados**
- **Senhas:** bcrypt com 12 rounds
- **Dados sensíveis:** AES-256-GCM
- **Comunicação:** HTTPS recomendado

#### 2. **Autenticação**
- **JWT:** Tokens seguros com expiração
- **Validação:** Verificação em cada requisição
- **Logout:** Remoção de tokens no client

#### 3. **Rate Limiting**
- **Autenticação:** 200 tentativas/15min
- **Contatos:** 200 operações/15min
- **Global:** 1000 requests/15min

#### 4. **Validação de Entrada**
- **Sanitização:** Todos os inputs
- **Tipos:** Validação rigorosa
- **Tamanhos:** Limites definidos

#### 5. **Headers de Segurança**
```http
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=31536000
```

#### 6. **Auditoria**
- **Logs:** Todas as operações
- **Rastreamento:** IP + User-Agent
- **Timestamps:** UTC precisos

### Proteções contra Ataques

| Ataque | Proteção |
|--------|----------|
| **SQL Injection** | Prepared Statements |
| **XSS** | Sanitização + Headers |
| **CSRF** | CORS configurado |
| **Brute Force** | Rate Limiting |
| **Session Hijacking** | JWT + HTTPS |
| **Data Exposure** | Criptografia AES |

---

## 🎯 Considerações para Produção

### Recomendações

1. **HTTPS:** Obrigatório em produção
2. **Environment:** Variáveis seguras (.env)
3. **Database:** SSL/TLS habilitado
4. **Monitoring:** Logs centralizados
5. **Backup:** Rotinas automatizadas
6. **Updates:** Dependências atualizadas

### Monitoramento

- **Health Check:** `GET /health`
- **Métricas:** Tempo de resposta
- **Alertas:** Erros 5xx
- **Auditoria:** Logs de segurança

---

## 📞 Suporte

Para dúvidas ou problemas:

- **Documentação:** Este arquivo
- **Logs:** Console do servidor
- **Debug:** Endpoint `/health`
- **Auditoria:** Tabela `audit_logs`

---

**🚀 Sistema desenvolvido com foco em segurança e performance!**