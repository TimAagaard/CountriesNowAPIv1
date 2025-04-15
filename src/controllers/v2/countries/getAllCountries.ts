import { Request, Response } from "express";

import { prisma } from "../../../configs/prisma";
import APIResponse from "../../../utils/APIResponse";

export default async function getAllCountries(req: Request, res: Response) {
    const result = await prisma.country.findMany({
        orderBy: {
            name: "asc",
        },
    });
    const response = new APIResponse(result, "").success();
    res.status(200).send(response);
}
