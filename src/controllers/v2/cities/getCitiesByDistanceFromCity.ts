import { Request, Response } from "express";

import { prisma } from "../../../configs/prisma";
import APIResponse from "../../../utils/APIResponse";
import { getBoundsOfDistance, isPointWithinRadius } from "geolib";

export default async function (req: Request, res: Response) {
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
    const minLat = Math.min(boundingBox[0].latitude, boundingBox[1].latitude);
    const maxLat = Math.max(boundingBox[0].latitude, boundingBox[1].latitude);
    const minLon = Math.min(boundingBox[0].longitude, boundingBox[1].longitude);
    const maxLon = Math.max(boundingBox[0].longitude, boundingBox[1].longitude);

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
}
