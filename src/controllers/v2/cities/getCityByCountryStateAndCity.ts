import { Request, Response } from "express";

import { prisma } from "../../../configs/prisma";
import APIResponse from "../../../utils/APIResponse";

export default async function (req: Request, res: Response) {
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
}
