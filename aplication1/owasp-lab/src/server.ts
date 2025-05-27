import express from "express";
import path from "path";
import bodyParser from "body-parser";
import session from "express-session";
import csurf from "csurf";
import cookieParser from "cookie-parser";

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser()); // Necessário para o express-session usar cookies

app.use(
  session({
    secret: "sua_chave_secreta_muito_segura_e_aleatoria", // Use uma chave forte em produção
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }, // true em produção (HTTPS)
  })
);

const csrfProtection = csurf({ cookie: true });

app.use(express.static(path.join(__dirname, "../public")));

let userPassword = "minhasenhasecreta123"; // Senha inicial simulada

// Endpoint VULNERÁVEL a CSRF
app.post("/change-password-vulnerable", (req, res) => {
  const { new_password } = req.body;
  console.log("\n--- Requisição VULNERÁVEL ---");
  console.log("Conteúdo de req.body (Vulnerável):", req.body);
  console.log(
    `[VULNERÁVEL] Tentativa de mudança de senha para: ${new_password}`
  );
  if (new_password) {
    userPassword = new_password;
    console.log(
      `[VULNERÁVEL] Senha alterada com sucesso para: ${userPassword}`
    );
    return res.redirect("/?status=password_changed_vulnerable");
  } else {
    console.log("[VULNERÁVEL] Nova senha não fornecida.");
    return res.redirect("/?status=password_not_changed_vulnerable");
  }
});

// Rota protegida por CSRF para servir o formulário
app.get("/protected-form", csrfProtection, (req, res) => {
  // req.csrfToken() só estará disponível se csrfProtection foi executado
  const csrfToken = req.csrfToken();
  console.log("\n--- Carregando Formulário Protegido ---");
  console.log("Token CSRF Gerado:", csrfToken); // Para você ver o token no console

  res.send(`
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Laboratório OWASP - Formulário Protegido</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; background-color: #f4f4f4; color: #333; }
                .container { background-color: #fff; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); max-width: 800px; margin: auto; }
                h1 { color: #0056b3; }
                p { line-height: 1.6; }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>Mudar Senha (PROTETIDA por CSRF)</h1>
                <p>Este formulário inclui um token CSRF para proteção.</p>
                <form action="/change-password-protected" method="POST">
                    <input type="hidden" name="_csrf" value="${csrfToken}">
                    <label for="new_password_protected">Nova Senha:</label>
                    <input type="password" id="new_password_protected" name="new_password" required>
                    <button type="submit">Mudar Senha Protegida</button>
                </form>
                <p id="protected-status" style="color: green;"></p>
                <p><a href="/">Voltar para a página inicial</a></p>
            </div>
            <script>
                document.addEventListener('DOMContentLoaded', () => {
                    const urlParams = new URLSearchParams(window.location.search);
                    const status = urlParams.get('status');
                    const protectedStatusDiv = document.getElementById('protected-status');

                    if (status === 'password_changed_protected') {
                        protectedStatusDiv.textContent = 'Senha PROTEGIDA alterada com sucesso!';
                        protectedStatusDiv.style.color = 'green';
                    } else if (status === 'password_not_changed_protected') {
                        protectedStatusDiv.textContent = 'Erro ao alterar senha PROTEGIDA.';
                        protectedStatusDiv.style.color = 'red';
                    }
                });
            </script>
        </body>
        </html>
    `);
});

// Endpoint PROTEGIDO por CSRF
app.post("/change-password-protected", csrfProtection, (req, res) => {
  const { new_password } = req.body;
  console.log("\n--- Requisição PROTEGIDA ---");
  console.log("Conteúdo de req.body (Protegido):", req.body);
  console.log(
    `[PROTEGIDO] Tentativa de mudança de senha para: ${new_password}`
  );

  // Se chegou aqui, o token CSRF foi validado com sucesso pelo middleware csrfProtection
  if (new_password) {
    userPassword = new_password;
    console.log(`[PROTEGIDO] Senha alterada com sucesso para: ${userPassword}`);
    return res.redirect("/protected-form?status=password_changed_protected");
  } else {
    console.log("[PROTEGIDO] Nova senha não fornecida.");
    return res.redirect(
      "/protected-form?status=password_not_changed_protected"
    );
  }
});

// Manipulador de erro para CSRF
app.use((err: any, req: any, res: any, next: any) => {
  if (err.code === "EBADCSRFTOKEN") {
    console.error("\n--- Erro CSRF Detectado ---");
    console.error("Erro CSRF: Token inválido!");
    res
      .status(403)
      .send(
        "Erro CSRF: Token de requisição inválido. Sua sessão pode ter expirado ou a requisição é maliciosa."
      );
  } else {
    next(err);
  }
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
  console.log("Pressione CTRL+C para parar o servidor");
});
