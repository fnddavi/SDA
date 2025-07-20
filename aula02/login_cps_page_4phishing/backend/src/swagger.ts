import swaggerUi from "swagger-ui-express";
import { Express } from "express";
import swaggerDocument from "../swagger.json";

export function setupSwagger(app: Express): void {
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
