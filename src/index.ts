import APIResponse from "#utils/APIResponse.js";
import { Request, Response } from "express";

import { app, startExpressServer } from "./configs/express.js";
import { prisma } from "./configs/prisma.js";
import { versionRouter } from "./routes/versionRouter.js";

app.use("/api", versionRouter);

app.get("/api/v0.2/countries/states", async (req: Request, res: Response) => {
    const countries = await prisma.country.findMany({
        orderBy: {
            name: "asc",
        },
        select: {
            iso2: true,
            iso3: true,
            name: true,
            states: {
                orderBy: {
                    name: "asc",
                },
                select: {
                    code: true,
                    name: true,
                },
            },
        },
    });

    const response = new APIResponse<typeof countries>(countries);
    res.send(response.success()).status(200);
});

startExpressServer();
