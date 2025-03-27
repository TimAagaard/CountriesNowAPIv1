import { prisma } from "#configs/prisma.js";
import APIResponse from "#utils/APIResponse.js";
import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

export const v1Controller = {
    getCitiesByCountry: async (req: Request, res: Response) => {
        const { country, iso2 } = req.query;

        let whereClause: Prisma.CountryWhereInput;
        if (iso2) {
            whereClause = {
                iso2: {
                    equals: (iso2 as string).toUpperCase(),
                },
            };
        } else if (country) {
            whereClause = {
                name: {
                    equals: country as string,
                },
            };
        } else {
            const response = new APIResponse(null).error(
                "One of the following fields are required: country, iso2",
            );
            res.status(400).send(response);
            return;
        }

        const countries = await prisma.country.findFirst({
            select: {
                states: {
                    select: {
                        cities: true,
                    },
                },
            },
            where: whereClause,
        });

        const cities: string[] = [];
        countries?.states.forEach((state) => {
            state.cities.forEach((city) => {
                cities.push(city.name);
            });
        });
        cities.sort();

        const citiesSet = [...new Set(cities)];

        const response = new APIResponse(citiesSet, "").success();
        res.status(200).send(response);
        return;
    },

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
    },

    getCountryCapital: async (req: Request, res: Response) => {
        const { country, iso2 } = req.query;

        let whereClause: Prisma.CountryWhereInput = {};
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

        const countries = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                capital: true,
                iso2: true,
                iso3: true,
                name: true,
            },
            where: whereClause,
        });

        const response = new APIResponse(countries, "").success();
        res.status(200).send(response);
    },

    getCountryCodes: async (req: Request, res: Response) => {
        const { country, iso2 } = req.query;

        let whereClause: Prisma.CountryWhereInput | undefined = undefined;
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

        const countries = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                dialCode: true,
                iso2: true,
                iso3: true,
                name: true,
            },
            where: whereClause,
        });

        const response = new APIResponse(countries, "").success();
        res.status(200).send(response);
    },

    getCountryCurrency: async (req: Request, res: Response) => {
        const { country, iso2 } = req.query;

        let whereClause: Prisma.CountryWhereInput = {};
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

        const countries = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                currencyCode: true,
                iso2: true,
                iso3: true,
                name: true,
            },
            where: whereClause,
        });

        const response = new APIResponse(countries).success();
        res.status(200).send(response);
    },

    getCountryFlagImage: async (req: Request, res: Response) => {
        const { country, iso2 } = req.query;

        let whereClause: Prisma.CountryWhereInput = {};
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

        const countries = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                flagSvg: true,
                iso2: true,
                iso3: true,
                name: true,
            },
            where: whereClause,
        });

        const response = new APIResponse(countries).success();
        res.status(200).send(response);
    },

    getCountryFlagUnicode: async (req: Request, res: Response) => {
        const { country, iso2 } = req.query;

        let whereClause: Prisma.CountryWhereInput = {};
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

        const countries = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                iso2: true,
                iso3: true,
                name: true,
                unicode: true,
            },
            where: whereClause,
        });

        const response = new APIResponse(countries, "").success();
        res.status(200).send(response);
    },

    getCountryISOCodes: async (req: Request, res: Response) => {
        const { country } = req.query;

        let whereClause: Prisma.CountryWhereInput = {};
        if (country) {
            whereClause = {
                name: {
                    equals: country as string,
                },
            };
        }

        const countries = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                iso2: true,
                iso3: true,
                name: true,
            },
            where: whereClause,
        });

        const response = new APIResponse(countries, "").success();
        res.status(200).send(response);
    },

    getCountryPositions: async (req: Request, res: Response) => {
        const { country, iso2 } = req.query;

        let whereClause: Prisma.CountryWhereInput = {};
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

        const countries = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
            select: {
                iso2: true,
                iso3: true,
                latitude: true,
                longitude: true,
                name: true,
            },
            where: whereClause,
        });

        const response = new APIResponse(countries, "").success();
        res.status(200).send(response);
    },

    getCountryRandom: async (_req: Request, res: Response) => {
        const minMax = await prisma.country.aggregate({
            _max: {
                id: true,
            },
            _min: {
                id: true,
            },
        });

        const minID = minMax._min.id;
        const maxID = minMax._max.id;

        if (typeof minID === "number" && typeof maxID === "number") {
            const randomID = Math.floor(
                Math.random() * (maxID - minID + 1) + minID,
            );
            const country = await prisma.country.findUnique({
                select: {
                    dialCode: true,
                    iso2: true,
                    latitude: true,
                    longitude: true,
                    name: true,
                },
                where: {
                    id: randomID,
                },
            });
            const response = new APIResponse(
                country,
                "Retrieved random country",
            ).success();
            res.status(200).send(response);
            return;
        } else {
            const response = new APIResponse(null).error(
                "Unable to find a random country",
            );
            res.status(404).send(response);
            return;
        }
    },

    getPopulations: async (req: Request, res: Response) => {
        const iso2 = req.query.iso2;

        let whereClause: Prisma.CountryWhereInput;

        if (iso2) {
            whereClause = {
                iso2: {
                    equals: (iso2 as string).toUpperCase(),
                },
            };
        } else {
            whereClause = {};
        }

        const populations = await prisma.country.findMany({
            select: {
                iso2: true,
                iso3: true,
                name: true,
                populations: {
                    orderBy: {
                        year: "asc",
                    },
                    select: {
                        value: true,
                        year: true,
                    },
                },
            },
            where: whereClause,
        });

        const response = new APIResponse(populations, "").success();
        res.status(200).send(response);
    },

    getPopulationsFiltered: async (req: Request, res: Response) => {
        const { gt, limit, lt, order, orderBy, year } = req.query;

        let limitVal: number | undefined;
        if (limit) {
            limitVal = parseInt(limit as string);
        } else {
            limitVal = undefined;
        }

        let gtVal: number | undefined;
        if (gt) {
            gtVal = parseInt(gt as string);
        } else {
            gtVal = undefined;
        }

        let ltVal: number | undefined;
        if (lt) {
            ltVal = parseInt(lt as string);
        } else {
            ltVal = undefined;
        }

        let orderVal: Prisma.SortOrder | undefined;
        if (!order) {
            orderVal = "asc";
        } else if (order === "asc" || order === "desc") {
            orderVal = order as string as Prisma.SortOrder;
        } else {
            orderVal = undefined;
        }

        let orderByVal: Prisma.CountryPopulationOrderByWithRelationInput;
        if (orderBy) {
            if (orderBy !== "year" && orderBy !== "population") {
                orderByVal = { year: orderVal };
            } else {
                if (orderBy === "year") {
                    orderByVal = { year: orderVal };
                } else {
                    orderByVal = { value: orderVal };
                }
            }
        } else {
            orderByVal = { year: orderVal };
        }

        const countries = await prisma.country.findMany({
            select: {
                iso2: true,
                iso3: true,
                name: true,
                populations: {
                    orderBy: orderByVal,
                    select: {
                        value: true,
                        year: true,
                    },
                    where: {
                        year: {
                            gt: gtVal,
                            lt: ltVal,
                        },
                    },
                },
            },
            take: limitVal,
            where: {
                NOT: {
                    populations: {
                        none: {},
                    },
                },
            },
        });

        if (!gt && !lt) {
            countries.forEach((country) => {
                if (country.populations.length) {
                    if (year) {
                        country.populations = country.populations.filter(
                            (population) =>
                                population.year == parseInt(year as string),
                        );
                    } else {
                        country.populations = [
                            country.populations[country.populations.length - 1],
                        ];
                    }
                } else {
                    country.populations = [];
                }
            });
        }

        const response = new APIResponse(
            countries,
            "Filtered result",
        ).success();
        res.status(200).send(response);
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
