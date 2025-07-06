import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config(); // Carrega as variáveis de ambiente do arquivo .env
export default new Pool({
  host: process.env.BD_HOST,
  user: process.env.BD_USER,
  password: process.env.BD_PASSWORD,
  database: process.env.BD_DATABASE,
  port: Number(process.env.BD_PORT),
});
