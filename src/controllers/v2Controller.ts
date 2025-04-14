import { Request, Response } from "express";
import { getBoundsOfDistance, isPointWithinRadius } from "geolib";

import { prisma } from "../configs/prisma";
import APIResponse from "../utils/APIResponse";

export const v2Controller = {
    /**
     * GET /api/v2/countries
     * @summary Returns all countries.
     * @description Returns all countries sorted by name ascendingly.
     * @response 200 - An APIRequest object with the data key's value set to an array of countries.
     * @responseContent {CountryArray} 200.application/json
     */
    getAllCountries: async (req: Request, res: Response) => {
        const result = await prisma.country.findMany({
            orderBy: {
                name: "asc",
            },
        });
        const response = new APIResponse(result, "").success();
        res.status(200).send(response);
    },

    /**
     * GET /api/v2/countries/cities/between/{lat1}/{lon1}/{lat2}/{lon2}
     * @summary Returns all cities between the specified latitudes and longitudes.
     * @description Returns all cities between the specified latitudes and longitudes sorted by name ascendingly.
     * @pathParam {number} lat1 - Latitude of coordinate one.
     * @pathParam {number} lon1 - Longitude of cordinate one.
     * @pathParam {number} lat2 - Latitude of coordinate two.
     * @pathParam {number} lon2 - Longitude of coordinate two.
     * @response 200 - An APIRequest object with the data key's value set to an array of cities between the specified latitude and longitude.
     * @responseContent {CityArray} 200.application/json
     */
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

    /**
     * GET /api/v2/countries/{countryIdOrName}/state/{stateIdOrName}/cities
     * @summary Gets all cities in the specified country and state.
     * @description Gets all cities in the specified country and state sorted by city name ascendingly.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {string} stateIdOrName - The ID or name of the state.
     * @response 200 - An APIRequest object with the data key's value set to an array of cities in the specified country and state.
     * @responseContent {CityArray} 200.application/json
     */
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

    /**
     * GET /api/v2/countries/{countryIdOrName}/state/{stateIdOrName}/city/{cityIdOrName}/within/{distanceAmount}/{distanceUnit}
     * @summary Gets all cities within the specified distance from the specified city.
     * @description Gets all cities within the specified distance from the specified city sorted by name ascendingly.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {string} stateIdOrName - The ID or name of the state.
     * @pathParam {string} cityIdOrName - The ID or name of the city.
     * @pathParam {number} distanceAmount - The distance to search within
     * @pathParam {DistanceUnit} distanceUnit - The unit of measurement for distance, either 'mi' or 'km'.
     * @response 200 - An APIResponse object with the data key's value set to an array of cities within the specified distance of the specified city.
     * @responseContent {CityArray} 200.application/json
     * @response 400 - An APIRequest object with the error value set to true and the msg value indicating the distance unit did not match an allowed value.
     * @responseContent {Error} 400.application/json
     * @response 404 - An APIRequest object with the error value set to true and the msg value indicating the origin city was not found.
     * @responseContent {Error} 404.application/json
     */
    getCitiesByDistanceFromCity: async (req: Request, res: Response) => {
        const {
            cityIdOrName,
            countryIdOrName,
            distanceAmount,
            distanceUnit,
            stateIdOrName,
        } = req.params;
        const city = await prisma.city.findFirst({
            where: {
                OR: [
                    { id: parseInt(cityIdOrName) || undefined },
                    { name: cityIdOrName },
                ],
                state: {
                    country: {
                        OR: [
                            { id: parseInt(countryIdOrName) || undefined },
                            { name: countryIdOrName },
                        ],
                    },
                    OR: [
                        { id: parseInt(stateIdOrName) || undefined },
                        { name: stateIdOrName },
                    ],
                },
            },
        });

        if (!city) {
            const response = new APIResponse(null).error("City not found");
            res.status(404).send(response);
            return;
        }

        const distanceUnits = ["mi", "km"];
        if (!distanceUnits.includes(distanceUnit.toLowerCase())) {
            const response = new APIResponse(null).error(
                "Distance units must be 'mi' or 'km'.",
            );
            res.status(400).send(response);
            return;
        }

        let distance = 0;
        if (distanceUnit.toLowerCase() === "mi") {
            distance = Number(distanceAmount) * 1609.34;
        } else if (distanceUnit.toLowerCase() === "km") {
            distance = Number(distanceAmount) * 1000;
        }

        const boundingBox = getBoundsOfDistance(
            { latitude: city.latitude, longitude: city.longitude },
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

        let results = await prisma.city.findMany({
            where: {
                AND: [
                    {
                        latitude: {
                            gte: minLat,
                            lte: maxLat,
                        },
                    },
                    {
                        longitude: {
                            gte: minLon,
                            lte: maxLon,
                        },
                    },
                ],
            },
        });
        results = results.filter((x) =>
            isPointWithinRadius(
                { latitude: x.latitude, longitude: x.longitude },
                { latitude: city.latitude, longitude: city.longitude },
                distance,
            ),
        );
        results.sort((a, b) => a.name.localeCompare(b.name));

        const response = new APIResponse(results).success();
        res.status(200).send(response);
    },

    /**
     * GET /api/v2/countries/{countryIdOrName}/state/{stateIdOrName}/city/{cityIdOrName}
     * @summary Gets the City specified as well as the associated State and Country.
     * @description Gets the City specified as well as the associated State and Country.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {string} stateIdOrName - The ID or name of the state.
     * @pathParam {string} cityIdOrName - The ID or name of the city.
     * @response 200 - An APIResponse object with the data key's value set to the specified city along with the nested state and state.country objects.
     * @responseContent {City} 200.application/json
     */
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

    /**
     * GET /api/v2/countries/between/{lat1}/{lon1}/{lat2}/{lon2}
     * @summary Gets all countries within the specified latitudes and longitudes.
     * @description Gets all countries within the specified latitudes and longitudes sorted by name ascendingly.
     * @pathParam {number} lat1 - Latitude of coordinate one.
     * @pathParam {number} lon1 - Longitude of coordinate one.
     * @pathParam {number} lat2 - Latitude of coordinate two.
     * @pathParam {number} lon2 - Longitude of coordinate two.
     * @response 200 - An APIResponse object with the data key's value set to an array of countries within the specified latitudes and longitudes
     * @responseContent {CountryArray} 200.application/json
     */
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

    /**
     * GET /api/v2/countries/{countryIdOrName}/within/{distanceAmount}/{distanceUnit}
     * @summary Gets all countries within the specified distance of the specified country.
     * @description Gets all countries within the specified distance of the specified country sorted by name ascendingly.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {number} distanceAmount - The distance from the specified country.
     * @pathParam {DistanceUnite} distanceUnit - The unit of distance, can be either 'km' or 'mi'.
     * @response 200 - An APIResponse object with the data key's value set to an array of countries within the specified distance from the specified country.
     * @responseContent {CountryArray} 200.application/json
     * @response 400 - An APIResponse object with the error value set to true and the msg value containing the reason for the error.
     * @responseContent {Error} 400.application/json
     * @response 404 - An APIResponse object with the error value set to true and the msg value containing the reason for the error.
     * @responseContent {Error} 404.application/json
     */
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

    /**
     * GET /api/v2/countries/{countryIdOrName}
     * @summary Gets the specified country.
     * @description Gets the specified country.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @response 200 - An APIResponse object with the data key's value set to the specified country.
     * @responseContent {Country} 200.application/json
     */
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

    /**
     * GET /api/v2/countries/{countryIdOrName}/state/{stateIdOrName}
     * @summary Gets the specified state.
     * @description Gets the specified state.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @pathParam {string} stateIdOrName - The ID or name of the state.
     * @response 200 - An APIResponse object with the data key's value set to the specified state and related country.
     * @responseContent {State} 200.application/json
     */
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

    /**
     * GET /api/v2/countries/{countryIdOrName}/states
     * @summary Gets the states in the specified country.
     * @description Gets the states in the specified country.
     * @pathParam {string} countryIdOrName - The ID or name of the country.
     * @response 200 - An APIResponse object with the data key's value set to an array of states within the specified country.
     * @responseContent {StateArray} 200.application/json
     */
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
