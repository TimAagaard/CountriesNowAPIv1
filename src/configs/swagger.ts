import openapi from "openapi-comment-parser";
import swaggerUi from "swagger-ui-express";

import { app } from "./express";

export function startSwagger() {
    const openApi = openapi({
        cwd: process.cwd(),
    });
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(openApi));
}
