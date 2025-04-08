import { Request, Response } from "express";

import { prisma } from "../configs/prisma";
import APIResponse from "../utils/APIResponse";

export const v2Controller = {
    getAllCountries: async (req: Request, res: Response) => {
        const result = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
        });
        const response = new APIResponse(result, "").success();
        res.status(200).send(response);
    },

    getCitiesByCountryAndState: async (req: Request, res: Response) => {
        const { countryIdOrName, stateIdOrName } = req.params;
        const results = await prisma.state.findMany({
            include: {
                cities: {
                    orderBy: {
                        name: "asc",
                    },
                },
                country: true,
            },
            where: {
                OR: [
                    { id: { equals: parseInt(stateIdOrName) || undefined } },
                    { name: { equals: stateIdOrName } },
                ],
            },
        });
        const response = new APIResponse(
            results
                .filter(
                    (x) =>
                        x.country.name === countryIdOrName ||
                        x.country.id === parseInt(countryIdOrName),
                )
                .map((x) => x.cities),
        ).success();
        res.status(200).send(response);
    },

    getCityByCountryStateAndCity: async (req: Request, res: Response) => {
        const { cityIdOrName, countryIdOrName, stateIdOrName } = req.params;
        const results = await prisma.city.findMany({
            include: {
                state: {
                    include: {
                        country: true,
                    },
                },
            },
            where: {
                OR: [
                    { id: { equals: parseInt(cityIdOrName) || undefined } },
                    { name: { equals: cityIdOrName } },
                ],
            },
        });
        const response = new APIResponse(
            results.filter(
                (x) =>
                    (x.state.id === parseInt(stateIdOrName) ||
                        x.state.name === stateIdOrName) &&
                    (x.state.country.id === parseInt(countryIdOrName) ||
                        x.state.country.name === countryIdOrName),
            ),
        ).success();
        res.status(200).send(response);
    },

    getCountryByIdOrName: async (req: Request, res: Response) => {
        const { countryIdOrName } = req.params;
        const results = await prisma.country.findFirst({
            where: {
                OR: [
                    { id: parseInt(countryIdOrName) || undefined },
                    { name: countryIdOrName },
                ],
            },
        });
        const response = new APIResponse(results).success();
        res.status(200).send(response);
    },

    getStateByIdOrName: async (req: Request, res: Response) => {
        const { countryIdOrName, stateIdOrName } = req.params;
        const results = await prisma.state.findMany({
            include: {
                country: true,
            },
            where: {
                OR: [
                    { id: { equals: parseInt(stateIdOrName) || undefined } },
                    { name: { equals: stateIdOrName } },
                ],
            },
        });
        const response = new APIResponse(
            results.filter(
                (x) =>
                    x.country.id === parseInt(countryIdOrName) ||
                    x.country.name === countryIdOrName,
            ),
        );
        res.status(200).send(response);
    },

    getStatesByCountry: async (req: Request, res: Response) => {
        const { countryIdOrName } = req.params;
        const results = await prisma.country.findFirst({
            include: {
                states: {
                    orderBy: {
                        name: "asc",
                    },
                },
            },
            where: {
                OR: [
                    { id: parseInt(countryIdOrName) || undefined },
                    { name: { equals: countryIdOrName } },
                ],
            },
        });
        const response = new APIResponse(results?.states).success();
        res.status(200).send(response);
    },
};
