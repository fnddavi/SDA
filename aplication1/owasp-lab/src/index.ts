// Importando os módulos necessários
import express from 'express';
import path from 'path';

const app = express();
const port = 3000;

// Middleware para servir arquivos estáticos da pasta 'public'
app.use(express.static(path.join(__dirname, '../public')));

// Rota padrão para servir o index.html (opcional, express.static já faria isso para '/')
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

// Iniciar o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log('Pressione CTRL+C para parar o servidor');
});

// Exportando o app para testes ou outros usos
export default app;