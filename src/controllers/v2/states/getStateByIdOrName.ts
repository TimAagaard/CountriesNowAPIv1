import { Request, Response } from "express";

import { prisma } from "../../../configs/prisma";
import APIResponse from "../../../utils/APIResponse";

export default async function (req: Request, res: Response) {
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
        )[0],
    ).success();

    res.status(200).send(response);
}
