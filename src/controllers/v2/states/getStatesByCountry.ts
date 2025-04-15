import { Request, Response } from "express";

import { prisma } from "../../../configs/prisma";
import APIResponse from "../../../utils/APIResponse";

export default async function (req: Request, res: Response) {
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
}
