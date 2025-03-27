import fs from "fs";
import { prisma } from "../src/configs/prisma";
import { Prisma } from "@prisma/client";

const PAGE_SIZE = 1;

function showProgressBar(completed: number, total: number) {
    const percentage = ((completed / total) * 100)
        .toFixed(2)
        .toString()
        .padStart(4, " ");
    const barLength = 50;
    const completedChars = "=".repeat(
        Math.floor((completed / total) * barLength),
    );
    const remainingChars = " ".repeat(barLength - completedChars.length);

    process.stdout.write("  [ " + percentage + " % ]");
    process.stdout.write("  |" + completedChars + remainingChars + "|");
    if (completed < total) {
        process.stdout.write("\r");
    } else {
        process.stdout.write("\n");
    }
}

async function getCountries(cursorId: number | undefined = undefined) {
    let selection: Prisma.CountryFindManyArgs = {
        include: {
            states: {
                include: {
                    cities: {
                        include: {
                            populations: true,
                        },
                    },
                },
            },
            populations: true,
        },
        orderBy: {
            name: "asc",
        },
        take: PAGE_SIZE,
    };
    if (cursorId) {
        selection.cursor = { id: cursorId };
        selection.skip = 1;
    }

    const data = await prisma.country.findMany(selection);

    return data;
}

const exportNDJSON = async (fileName: string) => {
    console.log(`Exporting to ${fileName}`);

    const numCountries: number = await prisma.country.count();
    let numProcessed = 0;
    let numPages = Math.ceil(numCountries / PAGE_SIZE);

    const stream = fs.createWriteStream(fileName);

    let cursor = undefined;
    for (let i = 0; i < numPages; i++) {
        const data = await getCountries(cursor);

        for (const country of data) {
            stream.write(JSON.stringify(country) + "\n");
        }

        cursor = data[PAGE_SIZE - 1]?.id;

        numProcessed += PAGE_SIZE;
        if (numProcessed > numCountries) {
            numProcessed = numCountries;
        }

        showProgressBar(numProcessed, numCountries);
        //console.log(numProcessed + "/" + numCountries);
        //console.log(data[data.length - 1].name);
    }

    console.log("Complete!");
    stream.close();
};

await exportNDJSON("./tools/data-sources/db-export.ndjson");
