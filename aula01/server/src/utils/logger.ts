// src/utils/logger.ts
import fs from "fs";
import path from "path";


const logFile = path.join(__dirname, "./access.log");

export function logSuspicious(data: {
  ip: string;
  username: string;
  reason: string;
}) {
  try {
    const logEntry = `[${new Date().toISOString()}] IP: ${
      data.ip
    } | Username: ${data.username} | Motivo: ${data.reason}\n`;
    fs.appendFileSync(logFile, logEntry);
  } catch (e: any) {
    console.error("Erro ao escrever no log:", e.message);
  }
}
