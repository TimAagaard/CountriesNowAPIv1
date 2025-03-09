import express from "express";

import { v1Router } from "./v1/v1Router.js";
import { v2Router } from "./v2/v2Router.js";

export const versionRouter = express.Router();

versionRouter.use("/v1/countries", v1Router);
versionRouter.use("/v0.1/countries", v1Router);

versionRouter.use("/v2/countries", v2Router);
