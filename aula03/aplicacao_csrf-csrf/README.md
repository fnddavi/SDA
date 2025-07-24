# Demonstração de Ataques CSRF

Este projeto demonstra vulnerabilidades CSRF (Cross-Site Request Forgery) e suas respectivas proteções usando Node.js, Express e PostgreSQL.

## Estrutura do Projeto

- **`server-vitima/`** - Servidor que simula uma aplicação vulnerável (porta 3001)
- **`server-ataque/`** - Servidor que simula um site atacante (porta 3002)

## Pré-requisitos

1. **Node.js** (versão 16 ou superior)
2. **PostgreSQL** instalado e configurado
3. **npm** ou **yarn**

## Configuração Inicial

### 1. Configuração do Arquivo hosts

Para simular diferentes domínios, edite o arquivo `/etc/hosts` (Linux/Mac):

```bash
sudo nano /etc/hosts
```

Adicione as seguintes linhas:
```
127.0.0.1   vitima.local
127.0.0.1   atacante.local
```

### 2. Configuração do Banco de Dados

1. **Crie um banco de dados PostgreSQL:**
```sql
CREATE DATABASE csrf_demo;
```

2. **Execute os comandos SQL** do arquivo `server-vitima/src/comandos.sql`:
```bash
psql -d csrf_demo -f server-vitima/src/comandos.sql
```

### 3. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na pasta `server-vitima/` com o seguinte conteúdo:

```env
PORT=3001
BD_HOST=localhost
BD_USER=seu_usuario_postgres
BD_PASSWORD=sua_senha_postgres
BD_DATABASE=csrf_demo
BD_PORT=5432
CSRF_SECRET=super-secret-key-em-producao-use-uma-chave-forte
```

Crie um arquivo `.env` na pasta `server-ataque/` com o seguinte conteúdo:

```env
PORT=3002
```

## Instalação e Execução

### 1. Instalar Dependências

**Para o servidor vítima:**
```bash
cd server-vitima
npm install
```

**Para o servidor atacante:**
```bash
cd server-ataque
npm install
```

### 2. Executar os Servidores

Abra dois terminais separados:

**Terminal 1 - Servidor Vítima:**
```bash
cd server-vitima
npm run dev
```
O servidor estará disponível em: http://vitima.local:3001

**Terminal 2 - Servidor Atacante:**
```bash
cd server-ataque
npm run dev
```
O servidor estará disponível em: http://atacante.local:3002

## Como Testar

### 1. Login no Sistema Vítima

1. Acesse: http://vitima.local:3001
2. Faça login com as credenciais:
   - **Usuário:** `ana` | **Senha:** `123`
   - **Usuário:** `pedro` | **Senha:** `456`
   - **Usuário:** `maria` | **Senha:** `789`

### 2. Testes de Ataques CSRF

#### Ataque CSRF via GET (Vulnerável)
1. Após fazer login, acesse: http://atacante.local:3002/csrf-get-attack
2. Observe que o ataque é executado automaticamente

#### Ataque CSRF via POST (Vulnerável - sem proteção)
1. Acesse: http://atacante.local:3002/csrf-post-attack
2. Clique no botão para executar o ataque

#### Ataque CSRF via POST (Protegido)
1. Acesse: http://atacante.local:3002/csrf-post-attack-seguro
2. O ataque será bloqueado devido às proteções implementadas

### 3. Demonstração de Proteção CSRF

1. Acesse: http://vitima.local:3001/csrf-demo
2. Esta página demonstra o uso correto do token CSRF

### 4. Alteração de Senha Protegida

1. Acesse: http://vitima.local:3001/change-pwd
2. Esta página requer senha atual para alteração (proteção adicional)

## Endpoints da API

### Servidor Vítima (http://vitima.local:3001)

- **POST /login** - Autenticação do usuário
- **POST /contact** - Adicionar contato (protegido com CSRF)
- **POST /change-password** - Alterar senha (protegido com CSRF)
- **POST /change-password-segura** - Alterar senha com verificação de origem
- **POST /change-password-exer03** - Alterar senha com validação de senha atual

### Servidor Atacante (http://atacante.local:3002)

- **GET /csrf-get-attack** - Página de ataque via GET
- **GET /csrf-post-attack** - Página de ataque via POST
- **GET /csrf-post-attack-seguro** - Página de ataque bloqueado

## Tecnologias Utilizadas

- **Node.js + TypeScript**
- **Express.js**
- **PostgreSQL**
- **csrf-csrf** - Biblioteca para proteção CSRF
- **cookie-parser** - Manipulação de cookies
- **cors** - Configuração de CORS

## Conceitos Demonstrados

1. **Vulnerabilidade CSRF** - Como ataques podem ser executados
2. **Double Submit Cookie** - Técnica de proteção CSRF
3. **SameSite Cookies** - Proteção adicional via configuração de cookies
4. **Verificação de Origem** - Validação do cabeçalho Origin
5. **Validação de Senha Atual** - Proteção adicional para operações sensíveis

## Observações de Segurança

- Este projeto é apenas para fins educacionais
- Em produção, sempre use HTTPS
- Configure cookies com `secure: true` em produção
- Use chaves secretas fortes para tokens CSRF
- Implemente sempre validações adequadas no backend

## Troubleshooting

### Erro de Conexão com o Banco
- Verifique se o PostgreSQL está rodando
- Confirme as credenciais no arquivo `.env`
- Teste a conexão com: `psql -h localhost -U seu_usuario -d csrf_demo`

### Erro de DNS (vitima.local/atacante.local não resolve)
- Verifique se editou corretamente o arquivo `/etc/hosts`
- Em alguns sistemas, pode ser necessário limpar o cache DNS

### Erro de CORS
- Verifique se está acessando os domínios corretos
- Confirme que os servidores estão rodando nas portas corretas


#### Como testar

        🧪 Como Testar:
        Login: Acesse http://vitima.local:3001 e faça login com ana/123

        Teste ataques CSRF:

        Ataque GET: http://atacante.local:3002/csrf-get-attack
        Ataque POST vulnerável: http://atacante.local:3002/csrf-post-attack
        Ataque POST protegido: http://atacante.local:3002/csrf-post-attack-seguro
        Demonstração de proteção: http://vitima.local:3001/csrf-demo

        🔐 Credenciais de Teste:
        ana/123
        pedro/456
        maria/789