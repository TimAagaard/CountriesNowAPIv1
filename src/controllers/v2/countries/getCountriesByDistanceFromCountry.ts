import { Request, Response } from "express";

import { prisma } from "../../../configs/prisma";
import APIResponse from "../../../utils/APIResponse";
import { getBoundsOfDistance, isPointWithinRadius } from "geolib";

export default async function (req: Request, res: Response) {
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

    const minLat = Math.min(boundingBox[0].latitude, boundingBox[1].latitude);
    const maxLat = Math.max(boundingBox[0].latitude, boundingBox[1].latitude);
    const minLon = Math.min(boundingBox[0].longitude, boundingBox[1].longitude);
    const maxLon = Math.max(boundingBox[0].longitude, boundingBox[1].longitude);

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
}
