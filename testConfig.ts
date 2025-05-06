import https from "https";
import http from "http";

import { app, startExpressServer } from "#configs/express.ts";
import { versionRouter } from "#routes/versionRouter.ts";

export let server: https.Server | http.Server;

beforeAll((done) => {
    process.env.PORT = "0";
    app.use("/api", versionRouter);
    server = startExpressServer();
    done();
});

afterAll((done) => {
    server.close(done);
});
