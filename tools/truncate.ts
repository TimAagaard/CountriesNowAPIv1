import { Prisma } from "@prisma/client";

import { prisma } from "../src/configs/prisma";

const truncate = Prisma.defineExtension({
    model: {
        $allModels: {
            async truncate(this): Promise<void> {
                try {
                    const tableName =
                        Prisma.getExtensionContext(this).$name ?? "";
                    const query = `DELETE FROM ${tableName}`;
                    await prisma.$executeRawUnsafe(query);
                    const query2 = `UPDATE sqlite_sequence SET seq = 0 WHERE name = '${tableName}'`;
                    await prisma.$executeRaw(Prisma.sql([query2]));
                } catch (err) {
                    console.error(err);
                }
            },
        },
    },
    name: "Truncate",
});

const xPrisma = prisma.$extends(truncate);

console.log("Truncating tables...");
await xPrisma.cityPopulation.truncate();
await xPrisma.city.truncate();
await xPrisma.state.truncate();
await xPrisma.countryPopulation.truncate();
await xPrisma.country.truncate();
console.log("Done");
