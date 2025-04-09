import { Request, Response } from "express";
import { getBoundsOfDistance, isPointWithinRadius } from "geolib";

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

    getCitiesBetweenLatitudeAndLongitude: async (
        req: Request,
        res: Response,
    ) => {
        const { lat1, lat2, lon1, lon2 } = req.params;

        const latitudes = [parseFloat(lat1), parseFloat(lat2)];
        const longitudes = [parseFloat(lon1), parseFloat(lon2)];

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);

        const minLon = Math.min(...longitudes);
        const maxLon = Math.max(...longitudes);

        const results = await prisma.city.findMany({
            where: {
                AND: [
                    {
                        latitude: {
                            gte: minLat,
                            lte: maxLat,
                        },
                        longitude: {
                            gte: minLon,
                            lte: maxLon,
                        },
                    },
                ],
            },
        });
        results.sort((a, b) => a.name.localeCompare(b.name));
        const response = new APIResponse(results).success();
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

    getCountriesBetweenLatitudeAndLongitude: async (
        req: Request,
        res: Response,
    ) => {
        const { lat1, lat2, lon1, lon2 } = req.params;

        const latitudes = [parseFloat(lat1), parseFloat(lat2)];
        const longitudes = [parseFloat(lon1), parseFloat(lon2)];

        const minLat = Math.min(...latitudes);
        const maxLat = Math.max(...latitudes);

        const minLon = Math.min(...longitudes);
        const maxLon = Math.max(...longitudes);

        const results = await prisma.country.findMany({
            where: {
                AND: [
                    {
                        latitude: {
                            gte: minLat,
                            lte: maxLat,
                        },
                        longitude: {
                            gte: minLon,
                            lte: maxLon,
                        },
                    },
                ],
            },
        });
        results.sort((a, b) => a.name.localeCompare(b.name));
        const response = new APIResponse(results).success();
        res.status(200).send(response);
    },

    getCountriesByDistanceFromCountry: async (req: Request, res: Response) => {
        const { countryIdOrName, distanceAmount, distanceUnit } = req.params;

        const distanceUnits = ["mi", "km"];

        if (!distanceUnits.includes(distanceUnit.toLowerCase())) {
            const response = new APIResponse(null).error(
                "Distance unit must be 'mi' or 'km'.",
            );
            res.status(400).send(response);
            return;
        }

        // Get country for latitude and longitude coords.
        const country = await prisma.country.findFirst({
            where: {
                OR: [
                    { id: { equals: parseInt(countryIdOrName) || undefined } },
                    { name: { equals: countryIdOrName } },
                ],
            },
        });

        if (!country) {
            const response = new APIResponse(null).error("Country not found");
            res.status(404).send(response);
            return;
        }

        // Convert distance from miles or kilometers to meters.
        let distance = 0;
        if (distanceUnit.toLowerCase() === "mi") {
            distance = 1609.34 * Number(distanceAmount);
        } else if (distanceUnit.toLowerCase() === "km") {
            distance = 1000 * Number(distanceAmount);
        }

        /* Get a bounding box that encompases the distance radius so we can
         * query a subset of countries that are close, but may be greater than
         * the requested distance
         */
        const boundingBox = getBoundsOfDistance(
            { latitude: country.latitude, longitude: country.longitude },
            distance,
        );

        const minLat = Math.min(
            boundingBox[0].latitude,
            boundingBox[1].latitude,
        );
        const maxLat = Math.max(
            boundingBox[0].latitude,
            boundingBox[1].latitude,
        );
        const minLon = Math.min(
            boundingBox[0].longitude,
            boundingBox[1].longitude,
        );
        const maxLon = Math.max(
            boundingBox[0].longitude,
            boundingBox[1].longitude,
        );

        // Get the countries inside the bounding box.
        let results = await prisma.country.findMany({
            where: {
                latitude: {
                    gte: minLat,
                    lte: maxLat,
                },
                longitude: {
                    gte: minLon,
                    lte: maxLon,
                },
            },
        });

        /*
         * Filter out the countries that are inside of the bounding box but
         * outside of the distance radius and sort them by name.
         */
        results = results.filter((x) =>
            isPointWithinRadius(
                { latitude: x.latitude, longitude: x.longitude },
                { latitude: country.latitude, longitude: country.longitude },
                distance,
            ),
        );
        results.sort((a, b) => a.name.localeCompare(b.name));

        const response = new APIResponse(results).success();
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
        return;
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
