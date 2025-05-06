import request from "supertest";
import https from "https";
import http from "http";
import "jest-sorted";

import { server } from "../../../testConfig";
import { app, startExpressServer } from "../../../src/configs/express";
import { versionRouter } from "../../../src/routes/versionRouter";

//let server: https.Server | http.Server;

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

/*
beforeAll((done) => {
    app.use("/api", versionRouter);
    server = startExpressServer();
    done();
});

afterAll((done) => {
    server.close(done);
});
*/

describe("State routes", () => {
    test("Get state by ID or name", async () => {
        const res = await request(server).get(
            "/api/v2/countries/United%20States/state/New%20York",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data).toEqual(
            expect.objectContaining<State>({
                id: expect.any(Number),
                countryId: expect.any(Number),
                name: "New York",
                code: expect.any(String),
                country: {
                    id: expect.any(Number),
                    name: "United States",
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
            }),
        );
    });

    test("Get states by country", async () => {
        const res = await request(server).get(
            "/api/v2/countries/United%20States/states",
        );
        expect(res.status).toEqual(200);
        expect(res.body.data.length).toBeGreaterThan(1);
        expect(res.body.data[0]).toEqual(
            expect.objectContaining<State>({
                id: expect.any(Number),
                countryId: expect.any(Number),
                name: expect.any(String),
                code: expect.any(String),
            }),
        );
        expect(res.body.data).toBeSorted({
            compare: (a, b) => {
                return a.name.localeCompare(b.name);
            },
        });
    });
});
