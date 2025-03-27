import fs from "fs";
import { glob } from "glob";
import { readFile } from "fs/promises";
import readline from "readline";
import { PrismaClient } from "@prisma/client";

import { CountriesAndFlag } from "./data-sources/countriesAndFlag.js";

const prisma = new PrismaClient();

class Country {
    name = null;
    iso2 = null;
    iso3 = null;
    latitude = null;
    longitude = null;
    continent = null;
    currencyName = null;
    currencyCode = null;
    unicode = null;
    capital = null;
    flagSvg = null;
    dialCode = null;
    states = [];
    populations = [];
}

class State {
    name = null;
    code = null;
    cities = [];
}

class CountryPopulation {
    year = null;
    value = null;
}

class CityPopulation {
    year = null;
    value = null;
    source = null;
}

class City {
    name = null;
    latitude = null;
    longitude = null;
}

async function importData() {
    let countries = new Map();

    let dataCountries = JSON.parse(
        await readFile(
            "./tools/data-sources/countries+states+cities.json",
            "utf-8",
        ),
    );

    for (const country of dataCountries) {
        if (!countries.has(country.iso2)) {
            let c = new Country();
            c.name = country.name;
            c.iso2 = country.iso2;
            c.iso3 = country.iso3;
            c.latitude = parseFloat(country.latitude);
            c.longitude = parseFloat(country.longitude);
            c.continent = country.region;
            c.currencyName = country.currency_name;
            c.currencyCode = country.currency;
            c.unicode = country.emoji;
            c.capital = country.capital;
            c.flagSvg = "";
            c.dialCode = country.phonecode;
            c.states = new Map();
            c.populations = [];

            const statesAndCities = glob.sync(
                `./tools/data-sources/data/${c.iso2.toLowerCase()}/*.ndjson`,
            );

            for (const file of statesAndCities) {
                const fileStream = fs.createReadStream(file);

                const rl = readline.createInterface({
                    input: fileStream,
                    crlfDelay: Infinity,
                });

                for await (const line of rl) {
                    const obj = JSON.parse(line);
                    let stateCode;

                    if (obj.address["ISO3166-2-lvl4"]) {
                        stateCode = obj.address["ISO3166-2-lvl4"].substring(
                            obj.address["ISO3166-2-lvl4"].lastIndexOf("-") + 1,
                        );
                    } else if (obj.address["ISO3166-2-lvl5"]) {
                        stateCode = obj.address["ISO3166-2-lvl5"].substring(
                            obj.address["ISO3166-2-lvl5"].lastIndexOf("-") + 1,
                        );
                    } else if (obj.address["ISO3166-2-lvl6"]) {
                        stateCode = obj.address["ISO3166-2-lvl6"].substring(
                            obj.address["ISO3166-2-lvl6"].lastIndexOf("-") + 1,
                        );
                    } else if (obj.address["ISO3166-2-lvl7"]) {
                        stateCode = obj.address["ISO3166-2-lvl7"].substring(
                            obj.address["ISO3166-2-lvl7"].lastIndexOf("-") + 1,
                        );
                    } else {
                        stateCode = obj.address.postcode;
                    }

                    if (
                        stateCode === undefined ||
                        obj.address.state === undefined ||
                        obj.name === undefined
                    ) {
                        continue;
                    }

                    if (!c.states.has(stateCode)) {
                        const s = new State();
                        s.name = obj.address.state;
                        s.code = stateCode;
                        s.cities = new Map();
                        c.states.set(stateCode, s);
                    }

                    const state = c.states.get(stateCode);

                    if (!state.cities.has(obj.name)) {
                        const city = new City();
                        city.name = obj.name;
                        city.latitude = obj.location[1];
                        city.longitude = obj.location[0];
                        city.populations = new Map();

                        if (obj.population) {
                            const cityPopulation = new CityPopulation();
                            cityPopulation.year = 2023;
                            cityPopulation.value = obj.population;
                            cityPopulation.source =
                                "© OpenStreetMap (openstreetmap.org/copyright)";
                            city.populations.set(2023, cityPopulation);
                        }

                        state.cities.set(obj.name, city);
                    }
                }
            }

            const flagObj = CountriesAndFlag.filter(
                (cf) => cf.name === c.name,
            )[0];
            c.flagSvg = flagObj?.flag || "";

            const countryPopulations = JSON.parse(
                await readFile("./tools/data-sources/population_json.json"),
            );
            const countryPopulation = countryPopulations.filter(
                (countryPopulation) =>
                    countryPopulation["Country Code"] === c.iso3,
            );
            for (const cPop of countryPopulation) {
                const pop = new CountryPopulation();
                pop.year = cPop.Year;
                pop.value = cPop.Value;
                c.populations.push(pop);
            }

            countries.set(country.iso2, c);
        }
    }

    countries = [...countries.values()];
    for (let i = 0; i < countries.length; i++) {
        countries[i].states = { create: [...countries[i].states.values()] };
        countries[i].populations = {
            create: [...countries[i].populations.values()],
        };
        for (let j = 0; j < countries[i].states.create.length; j++) {
            countries[i].states.create[j].cities = {
                create: [...countries[i].states.create[j].cities.values()],
            };
            for (
                let k = 0;
                k < countries[i].states.create[j].cities.create.length;
                k++
            ) {
                countries[i].states.create[j].cities.create[k].populations = {
                    create: [
                        ...countries[i].states.create[j].cities.create[
                            k
                        ].populations.values(),
                    ],
                };
            }
        }
    }

    try {
        for (const country of countries) {
            await prisma.country.create({ data: country });
        }
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

await importData();
