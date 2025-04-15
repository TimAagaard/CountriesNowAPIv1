import { Request, Response } from "express";

import { prisma } from "../../../configs/prisma";
import APIResponse from "../../../utils/APIResponse";

export default async function (req: Request, res: Response) {
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
}
