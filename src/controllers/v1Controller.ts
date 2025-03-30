import { Prisma } from "@prisma/client";
import { Request, Response } from "express";

import { prisma } from "../configs/prisma";
import APIResponse from "../utils/APIResponse";

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

    getPopulationsByCity: async (req: Request, res: Response) => {
        const { city } = req.query;

        interface populationType {
            source: string;
            value: number;
            year: number;
        }

        interface returnDataType {
            country: string;
            name: string;
            populationCounts: Map<number, populationType> | populationType[];
            state: string;
        }

        if (city) {
            const cities = await prisma.city.findMany({
                select: {
                    name: true,
                    populations: true,
                    state: {
                        select: {
                            country: {
                                select: {
                                    name: true,
                                },
                            },
                            name: true,
                        },
                    },
                },
                where: {
                    AND: [
                        {
                            name: {
                                equals: city as string,
                            },
                        },
                        {
                            NOT: [
                                {
                                    populations: {
                                        none: {},
                                    },
                                },
                            ],
                        },
                    ],
                },
            });
            const retVal: returnDataType[] = cities.map((city) => {
                return {
                    country: city.state.country.name,
                    name: city.name,
                    populationCounts: city.populations.map((population) => {
                        return {
                            source: population.source,
                            value: population.value,
                            year: population.year,
                        };
                    }),
                    state: city.state.name,
                };
            });
            const response = new APIResponse(retVal).success();
            res.status(200).send(response);
            return;
        } else {
            // Get All Cities with a population
            // Prisma's take function is bugged so this is commented out until
            // it is fixed, and a raw query is used instead.
            /*
            const populationIds = await prisma.cityPopulation.findMany({
                distinct: ["cityId"],
                select: {
                    cityId: true,
                },
            });
            const cities = await prisma.city.findMany({
                select: {
                    name: true,
                    populations: true,
                    state: {
                        select: {
                            country: {
                                select: {
                                    name: true,
                                },
                            },
                            name: true,
                        },
                    },
                },
                take: 1, // This is clearly returning more than 1 record, 385 times this value to be exact.
                where: {
                    id: {
                        in: populationIds.map((x) => x.cityId),
                    },
                },
            });
            */

            interface rawDataType {
                city: string;
                cityId: number;
                country: string;
                source: string;
                state: string;
                value: number;
                year: number;
            }

            const data: rawDataType[] = await prisma.$queryRaw(
                Prisma.sql`
                    SELECT City.id AS 'cityId', Country.name AS 'country', State.name AS 'state', City.name AS 'city', CityPopulation.year, CityPopulation.value, CityPopulation.source
                    FROM City
                    JOIN CityPopulation ON City.id = CityPopulation.cityId
                    JOIN State ON State.id = City.stateId
                    JOIN Country ON Country.id = State.countryId
                    WHERE City.id IN (SELECT DISTINCT CityPopulation.cityId FROM CityPopulation);
                `,
            );
            const retVal: Map<number, returnDataType> = new Map<
                number,
                returnDataType
            >();
            for (const d of data) {
                if (!retVal.has(d.cityId)) {
                    retVal.set(d.cityId, {
                        country: d.country,
                        name: d.city,
                        populationCounts: new Map<number, populationType>(),
                        state: d.state,
                    });
                }

                const populations = retVal.get(d.cityId)
                    ?.populationCounts as Map<number, populationType>;

                if (!populations.has(d.year)) {
                    populations.set(d.year, {
                        source: d.source,
                        value: d.value,
                        year: d.year,
                    });
                }
            }

            for (const r of retVal.values()) {
                r.populationCounts = [...r.populationCounts.values()];
            }
            const response = new APIResponse([...retVal.values()]).success();
            res.status(200).send(response);
            return;
        }
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
