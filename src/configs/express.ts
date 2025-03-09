import express, { Express } from "express";
import fs from "fs";
import http from "http";
import https from "https";
import path from "path";

export const app: Express = express();
export const EXPRESS_PORT: number | string = process.env.PORT ?? 3000;

const USE_HTTPS = process.env.NODE_ENV !== "local";

export function startExpressServer() {
    let server;

    if (USE_HTTPS) {
        const credentials = {
            cert: fs.readFileSync(path.resolve(process.env.SSL_CERT ?? "")),
            key: fs.readFileSync(path.resolve(process.env.SSL_PRIVKEY ?? "")),
        };
        server = https.createServer(credentials, (req, res) => {
            app(req, res);
        });
    } else {
        server = http.createServer((req, res) => {
            app(req, res);
        });
    }
    server.listen(EXPRESS_PORT, () => {
        console.log(`Server listening on port ${EXPRESS_PORT.toString()}`);
    });
    process.on("SIGINT", (server: http.Server | https.Server) => {
        shutdownHandler(server);
    });
    process.on("SIGTERM", (server: http.Server | https.Server) => {
        shutdownHandler(server);
    });
}

function shutdownHandler(server: http.Server | https.Server) {
    console.log("Shutting down the Express server...");
    server.close((err) => {
        console.error(err);
        console.log("Server no longer accepting incoming requests...");
        process.exit(0);
    });

    setTimeout(() => {
        console.error("Could not close already open connections in time.");
        console.error("Forcefully closing open connections...");
        server.closeAllConnections();
        process.exit(1);
    }, 5000);
}
