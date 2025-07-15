## Segurança no Desenvolvimento de Aplicações 

Este repositório contém o código utilizado na aula sobre vulnerabilidades do tipo Cross-Site Scripting (XSS), abordando diferentes formas de ataque e estratégias de mitigação.

### Objetivos

O principal objetivo deste projeto é demonstrar, na prática, como ocorrem os ataques de XSS e como preveni-los. Os tópicos abordados são:
1. Introdução ao Cross-Site Scripting (XSS);
2. Stored XSS (XSS armazenado);
3. Reflected XSS (XSS refletido);
4. DOM-based XSS (XSS baseado no DOM).

### Como executar o projeto

1. Clonando o repositório e instalando as dependências
```
git clone http://github.com/arleysouza/xss.git server
cd server
npm i
```

2. Configurando o BD PostgreSQL
- Crie um BD chamado `bdaula` no PostgreSQL (ou outro nome de sua preferência);
- Atualize o arquivo `.env` com os dados de acesso ao banco;

3. Execute os comandos SQL presentes no arquivo `src/comandos.sql` para criar as tabelas necessárias;

4. Iniciando o servidor
```
npm start
npm run dev
```

### Observações

- O projeto utiliza Express.js e TypeScript.
- Para testes de XSS, diversas páginas foram disponibilizadas na pasta `public/` e estão mapeadas por rotas específicas no servidor.
- Alguns endpoints simulam situações vulneráveis para fins didáticos. Jamais use essas práticas em aplicações reais sem as devidas validações e sanitizações.