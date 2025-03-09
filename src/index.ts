import { Request, Response } from "express";

import { app, startExpressServer } from "./configs/express.js";
import { prisma } from "./configs/prisma.js";

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

    try {
        res.send(countries).status(200);
    } catch (err) {
        console.error(err);
    }
});

startExpressServer();
