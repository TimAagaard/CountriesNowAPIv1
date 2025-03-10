import { app, startExpressServer } from "./configs/express.js";
import { versionRouter } from "./routes/versionRouter.js";

app.use("/api", versionRouter);

startExpressServer();
