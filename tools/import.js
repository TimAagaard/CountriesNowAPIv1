import { readFile } from "fs/promises";
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

class Population {
    year = null;
    value = null;
}

class City {
    name = null;
    latitude = null;
    longitude = null;
}

const countries = new Map();

async function importData() {
    let countries = new Map();

    let countriesStatesCities = [];

    try {
        countriesStatesCities = JSON.parse(
            await readFile(
                "./tools/data-sources/countries+states+cities.json",
                "utf-8",
            ),
        );

        countriesStatesCities.forEach((country) => {
            if (!countries.has(country.iso3)) {
                const c = new Country();
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
                c.states = [];
                c.populations = [];

                country.states.forEach((state) => {
                    const s = new State();
                    s.name = state.name;
                    s.code = state.state_code || "-";
                    s.cities = [];

                    state.cities.forEach((city) => {
                        const ci = new City();
                        ci.name = city.name;
                        ci.latitude = parseFloat(city.latitude);
                        ci.longitude = parseFloat(city.longitude);

                        s.cities.push(ci);
                    });

                    c.states.push(s);
                });

                countries.set(country.iso3, c);
            }
        });
    } catch (err) {
        console.error(err);
    }

    const populations = JSON.parse(
        await readFile("./tools/data-sources/population_json.json"),
    );

    populations.forEach((population) => {
        if (countries.has(population["Country Code"])) {
            const tempC = countries.get(population["Country Code"]);
            const p = new Population();
            p.value = population["Value"];
            p.year = population["Year"];
            tempC.populations.push(p);
            countries.set(population["Country Code"], tempC);
        }

        /*
        const tempC = countries.get(population["Country Code"]);
        const p = new Population();
        p.value = population.Value;
        p.year = population.Year;
        tempC.population.push(p);
        */
    });

    countries = [...countries.values()];

    let countries2 = new Map();
    countries.forEach((c) => {
        countries2.set(c.dialCode, c);
    });

    CountriesAndFlag.forEach((cf) => {
        if (countries2.has(cf.number.substring(1))) {
            const c = countries2.get(cf.number.substring(1));
            c.flagSvg = cf.flag;
            countries2.set(cf.number.substring(1), c);
        }
    });

    countries = [...countries2.values()];
    //console.dir(countries, { depth: null });

    /*
     * countries now has an array of the completed objects - now just to change
     * each one into an object that prisma can save via the model's create
     * function.
     */

    countries.forEach(async (country) => {
        const states = country.states;
        const populations = country.populations;

        states.forEach((state) => {
            state.cities = {
                create: state.cities,
            };
        });

        country.states = {
            create: country.states,
        };

        country.populations = {
            create: country.populations,
        };

        //console.dir(country, { depth: null });

        try {
            await prisma.country.create({ data: country });
        } catch (err) {
            console.error(err);
            process.exit(1);
        }
    });

    //prisma.country.create()

    //console.dir(countries, { depth: null });
}

importData();
