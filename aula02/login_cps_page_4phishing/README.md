# Login CPS - Simulador de Phishing

Projeto educacional para demonstração de técnicas de phishing em aulas de Segurança da Informação.

## ⚠️ AVISO IMPORTANTE

Este projeto é destinado **exclusivamente para fins educacionais** em ambiente controlado. O uso inadequado pode constituir crime.

## 🚀 Como Executar

### 1. Instalar dependências

```bash
cd backend
npm install
```

### 2. Executar o servidor

```bash
npm run dev
```

### 3. Acessar a aplicação

- **Página de phishing**: <http://localhost:3000>
- **Documentação da API**: <http://localhost:3000/docs>

## 📋 Funcionalidades

- Interface que replica o login do SIGA CPS
- Captura de credenciais em tempo real
- Log automático em arquivo CSV (`backend/logs/login.csv`)
- Redirecionamento automático para o site oficial após captura
- API documentada com Swagger

## 🛠️ Tecnologias

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: HTML, CSS, JavaScript
- **Logging**: Sistema de arquivos (CSV)

## 📁 Estrutura

```text
├── frontend/           # Interface de phishing
├── backend/           # API e servidor
└── backend/logs/      # Logs das credenciais capturadas
```

## 📝 Scripts Disponíveis

- `npm start` - Executa em produção
- `npm run dev` - Executa em modo desenvolvimento (nodemon)

---

### Desenvolvido para fins educacionais - SDA 2025
