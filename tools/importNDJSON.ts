import fs from "fs";
import readline from "readline";
import { Prisma } from "@prisma/client";
import { prisma } from "../src/configs/prisma";

async function getFileLineCount(fileName: string): Promise<number> {
    let numLines = 0;

    const stream = fs.createReadStream(fileName);

    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        if (line) {
            numLines++;
        }
    }

    return numLines;
}

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

function convertCountryToPrismaCreate(
    country: Prisma.CountryGetPayload<{
        include: {
            states: {
                include: {
                    cities: {
                        include: {
                            populations: true;
                        };
                    };
                };
            };
            populations: true;
        };
    }>,
): Prisma.CountryCreateArgs {
    let newCountry = {
        name: country.name,
        iso2: country.iso2,
        iso3: country.iso3,
        latitude: country.latitude,
        longitude: country.longitude,
        continent: country.continent,
        currencyName: country.currencyName,
        currencyCode: country.currencyCode,
        unicode: country.unicode,
        capital: country.capital,
        flagSvg: country.flagSvg,
        dialCode: country.dialCode,
        states: { create: [] as any },
        populations: { create: [] as any },
    };

    for (const state of country.states) {
        const createState = {
            name: state.name,
            code: state.code,
            cities: { create: [] as any },
        };
        for (const city of state.cities) {
            const createCity = {
                name: city.name,
                latitude: city.latitude,
                longitude: city.longitude,
                populations: { create: [] as any },
            };

            for (const population of city.populations) {
                const newPopulation = {
                    year: population.year,
                    value: population.value,
                    source: population.source,
                };
                createCity.populations.create.push(newPopulation);
            }
            createState.cities.create.push(createCity);
        }
        newCountry.states.create.push(createState);
    }

    for (const population of country.populations) {
        const newPopulation = {
            year: population.year,
            value: population.value,
        };

        newCountry.populations.create.push(newPopulation);
    }

    return { data: newCountry };
}

async function importNDJSON(fileName: string) {
    console.log(`Importing from ${fileName}`);

    const numLines = await getFileLineCount(fileName);
    let processedLines = 0;

    const stream = fs.createReadStream(fileName);

    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity,
    });

    for await (const line of rl) {
        const country = convertCountryToPrismaCreate(JSON.parse(line));
        await prisma.country.create(country);
        processedLines++;
        showProgressBar(processedLines, numLines);
    }

    console.log("Complete!");
}

await importNDJSON("tools/data-sources/db-export.ndjson");
