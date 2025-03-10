import { prisma } from "#configs/prisma.js";
import APIResponse from "#utils/APIResponse.js";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

export const v1Controller = {
    getStates: async (req: Request, res: Response) => {
        const { country, iso2 } = req.query;
        let whereClause = null;

        if (country) {
            whereClause = {
                name: {
                    equals: country as string,
                },
            };
        } else if (iso2) {
            whereClause = {
                iso2: {
                    equals: (iso2 as string).toUpperCase(),
                },
            };
        }

        const countriesObj: Prisma.CountryFindManyArgs = {
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
            where: whereClause ?? {},
        };

        const countries = await prisma.country.findMany(countriesObj);

        const response = new APIResponse<typeof countries>(
            countries,
            "Countries and states retrieved",
        );

        res.send(response).status(200);
    },
};
