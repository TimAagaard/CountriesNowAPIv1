import request from "supertest";
import "jest-sorted";

import { server } from "../../../testConfig";

type Country = {
    id: number;
    name: string;
    iso2: string;
    iso3: string;
    latitude: number;
    longitude: number;
    continent: string;
    currencyName: string;
    currencyCode: string;
    unicode: string;
    capital: string;
    flagSvg: string;
    dialCode: string;
};

describe("Country routes", () => {
    test("Get all countries", async () => {
        const res = await request(server).get("/api/v2/countries");

        expect(res.status).toEqual(200);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<Country>({
                id: expect.any(Number),
                name: expect.any(String),
                iso2: expect.any(String),
                iso3: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
                continent: expect.any(String),
                currencyName: expect.any(String),
                currencyCode: expect.any(String),
                unicode: expect.any(String),
                capital: expect.any(String),
                flagSvg: expect.any(String),
                dialCode: expect.any(String),
            }),
        );
    });

    test("Get countries between latitude and longitude", async () => {
        const res = await request(server).get(
            "/api/v2/countries/between/20/-120/50/-80",
        );

        expect(res.status).toEqual(200);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<Country>({
                id: expect.any(Number),
                name: expect.any(String),
                iso2: expect.any(String),
                iso3: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
                continent: expect.any(String),
                currencyName: expect.any(String),
                currencyCode: expect.any(String),
                unicode: expect.any(String),
                capital: expect.any(String),
                flagSvg: expect.any(String),
                dialCode: expect.any(String),
            }),
        );
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });
    });

    test("Get countries by distance from country", async () => {
        let res = await request(server).get(
            "/api/v2/countries/Jamaica/within/500/km",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<Country>({
                id: expect.any(Number),
                name: expect.any(String),
                iso2: expect.any(String),
                iso3: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
                continent: expect.any(String),
                currencyName: expect.any(String),
                currencyCode: expect.any(String),
                unicode: expect.any(String),
                capital: expect.any(String),
                flagSvg: expect.any(String),
                dialCode: expect.any(String),
            }),
        );
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });

        res = await request(server).get(
            "/api/v2/countries/Jamaica/within/311/mi",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<Country>({
                id: expect.any(Number),
                name: expect.any(String),
                iso2: expect.any(String),
                iso3: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
                continent: expect.any(String),
                currencyName: expect.any(String),
                currencyCode: expect.any(String),
                unicode: expect.any(String),
                capital: expect.any(String),
                flagSvg: expect.any(String),
                dialCode: expect.any(String),
            }),
        );
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });

        res = await request(server).get(
            "/api/v2/countries/Jamaica/within/50/ab",
        );
        expect(res.status).toEqual(400);

        res = await request(server).get(
            "/api/v2/countries/Jamrock/within/500/km",
        );
        expect(res.status).toEqual(404);
    });

    test("Get country by ID or name", async () => {
        const res = await request(server).get("/api/v2/countries/Italy");
        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining<Country>({
                id: expect.any(Number),
                name: "Italy",
                iso2: expect.any(String),
                iso3: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
                continent: expect.any(String),
                currencyName: expect.any(String),
                currencyCode: expect.any(String),
                unicode: expect.any(String),
                capital: expect.any(String),
                flagSvg: expect.any(String),
                dialCode: expect.any(String),
            }),
        );
    });
});
