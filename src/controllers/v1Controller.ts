import { prisma } from "#configs/prisma.js";
import APIResponse from "#utils/APIResponse.js";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

export const v1Controller = {
    getCitiesByStateAndCountry: async (req: Request, res: Response) => {
        const { country, state } = req.query;

        if (!(country && state)) {
            const response = new APIResponse(null).error(
                "The following fields are required: country, state",
            );
            res.status(400).send(response);
            return;
        }

        const selection = await prisma.country.findFirst({
            select: {
                name: true,
                states: {
                    select: {
                        cities: {
                            select: {
                                name: true,
                            },
                        },
                        name: true,
                    },
                    where: {
                        name: {
                            equals: state as string,
                        },
                    },
                },
            },
            where: {
                name: {
                    equals: country as string,
                },
            },
        });

        if (!selection) {
            const response = new APIResponse(null).error("Country not found");
            res.status(404).send(response);
            return;
        } else {
            if (selection.states.length !== 0) {
                const response = new APIResponse(
                    selection.states[0].cities.map((city) => city.name),
                    `Cities in state ${selection.states[0].name} of country ${selection.name}`,
                ).success();
                res.status(200).send(response);
                return;
            } else {
                const response = new APIResponse(null).error("State not found");
                res.status(404).send(response);
                return;
            }
        }

        res.send().status(500);
        return;
    },

    getStatesByCountryOrISO2: async (req: Request, res: Response) => {
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
            country || iso2
                ? `States in ${countries[0].name} retrieved`
                : "Countries and states retrieved",
        );

        res.status(200).send(response);
    },
};
