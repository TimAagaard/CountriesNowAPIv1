import { PrismaClient } from "@prisma/client";
import express, { Express, Request, Response } from "express";

const prisma: PrismaClient = new PrismaClient();
const app: Express = express();
const port: number | string = process.env.PORT ?? 3000;

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

app.listen(port, () => {
    console.log(`App listening on port ${port.toString()}`);
});
