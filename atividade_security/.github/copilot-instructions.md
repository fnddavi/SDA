<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Instruções do Projeto - Sistema de Cadastro Seguro

Este é um projeto de aplicação web cliente-servidor para cadastro de usuários e gerenciamento de contatos pessoais com foco em segurança.

## Características do Projeto:
- **Backend**: Node.js + TypeScript + Express + PostgreSQL
- **Frontend**: HTML, CSS, JavaScript vanilla
- **Segurança**: 
  - Autenticação JWT
  - Criptografia híbrida (RSA + AES) para comunicação
  - Criptografia de dados sensíveis no banco
  - Hashing de senhas com bcrypt
  - Proteção contra ataques comuns (CORS, Helmet)

## Estrutura:
- `src/`: Código fonte do backend TypeScript
- `public/`: Frontend (HTML, CSS, JS)
- `sql/`: Scripts de criação do banco de dados
- `.env`: Configurações de ambiente (não versionar)

## Padrões de Código:
- Use TypeScript com tipagem estrita
- Implemente middleware de autenticação e autorização
- Valide todos os inputs do usuário
- Use prepared statements para queries SQL
- Implemente logging adequado para auditoria de segurança
