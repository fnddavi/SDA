import { z } from "zod";


export const loginSchema = z
  .object({
    username: z
      .string()
      .min(3, { message: "Usuário deve ter no mínimo 3 caracteres" })
      .max(20, { message: "Usuário deve ter no máximo 20 caracteres" })
      .regex(/^[\w.-]+$/, { message: "Usuário contém caracteres inválidos" }),
    password: z
      .string()
      .min(6, { message: "Senha deve ter no mínimo 6 caracteres" })
      .max(10, { message: "Senha deve ter no máximo 10 caracteres" }),
  })
  .strict();
