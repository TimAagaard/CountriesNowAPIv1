import { Request, Response } from "express";

import { prisma } from "../../../configs/prisma";
import APIResponse from "../../../utils/APIResponse";

export default async function (req: Request, res: Response) {
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
            .map((x) => x.cities)[0]
            .sort((a, b) => a.name.localeCompare(b.name)),
    ).success();
    res.status(200).send(response);
}
