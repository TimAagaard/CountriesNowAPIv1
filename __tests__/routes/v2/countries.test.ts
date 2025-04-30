import request from "supertest";
import https from "https";
import http from "http";

import { app, startExpressServer } from "../../../src/configs/express";
import { versionRouter } from "../../../src/routes/versionRouter";

let server: https.Server | http.Server;

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

beforeAll((done) => {
    app.use("/api", versionRouter);
    server = startExpressServer();
    done();
});

afterAll((done) => {
    server.close(done);
});

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
});
