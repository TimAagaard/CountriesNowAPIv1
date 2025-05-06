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

type State = {
    id: number;
    countryId: number;
    name: string;
    code: string;
    country?: Country;
};

type City = {
    id: number;
    stateId: number;
    name: string;
    latitude: number;
    longitude: number;
    state?: State;
};

describe("City routes", () => {
    test("Get cities between latitude and longitude", async () => {
        const res = await request(server).get(
            "/api/v2/countries/cities/between/42/-76/43/-77",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<City>({
                id: expect.any(Number),
                stateId: expect.any(Number),
                name: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
            }),
        );
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });
    });

    test("Get cities by country and state", async () => {
        let res = await request(server).get(
            "/api/v2/countries/United%20States/state/New%20York/cities",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<City>({
                id: expect.any(Number),
                stateId: expect.any(Number),
                name: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
            }),
        );
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });

        res = await request(server).get(
            "/api/v2/countries/236/state/3298/cities",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<City>({
                id: expect.any(Number),
                stateId: expect.any(Number),
                name: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
            }),
        );
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });
    });

    test("Get cities by distance from city", async () => {
        let res = await request(server).get(
            "/api/v2/countries/United%20States/state/New%20York/city/Ithaca/within/15/mi",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<City>({
                id: expect.any(Number),
                stateId: expect.any(Number),
                name: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
            }),
        );
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });

        res = await request(server).get(
            "/api/v2/countries/United%20States/state/New%20York/city/Ithaca/within/24.14/km",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<City>({
                id: expect.any(Number),
                stateId: expect.any(Number),
                name: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
            }),
        );
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });

        res = await request(server).get(
            "/api/v2/countries/United%20States/state/New%20York/city/PartyCity/within/15/mi",
        );
        expect(res.status).toEqual(404);

        res = await request(server).get(
            "/api/v2/countries/United%20States/state/New%20York/city/Ithaca/within/15/bananas",
        );
        expect(res.status).toEqual(400);
    });

    test("Get city by country, state, and city", async () => {
        const res = await request(server).get(
            "/api/v2/countries/United%20States/state/New%20York/city/Ithaca",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining<City>({
                id: expect.any(Number),
                stateId: expect.any(Number),
                name: expect.any(String),
                latitude: expect.any(Number),
                longitude: expect.any(Number),
                state: {
                    id: expect.any(Number),
                    countryId: expect.any(Number),
                    name: expect.any(String),
                    code: expect.any(String),
                    country: {
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
                    },
                },
            }),
        );
    });
});
