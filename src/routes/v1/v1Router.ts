import { v1Controller } from "#controllers/v1Controller.js";
import express from "express";

export const v1Router = express.Router();

v1Router.get("/", (_req, res) => {
    res.send({ message: "v1 working" });
});
v1Router.get("/capital");
v1Router.get("/cities", v1Controller.getCitiesByCountry);
v1Router.get("/codes", v1Controller.getCountryCodes);
v1Router.get("/currency");
v1Router.get("/flag/images");
v1Router.get("/flag/unicode");
v1Router.get("/info");
v1Router.get("/iso", v1Controller.getCountryISOCodes);
v1Router.get("/population", v1Controller.getPopulations);
v1Router.get("/population/cities");
v1Router.get("/population/cities/filter");
v1Router.get("/population/filter", v1Controller.getPopulationsFiltered);
v1Router.get("/positions");
v1Router.get("/positions/range");
v1Router.get("/random", v1Controller.getCountryRandom);
v1Router.get("/states", v1Controller.getStatesByCountryOrISO2);
v1Router.get("/state/cities", v1Controller.getCitiesByStateAndCountry);
