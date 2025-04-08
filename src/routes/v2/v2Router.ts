import express from "express";

import { v2Controller } from "../../controllers/v2Controller";

export const v2Router = express.Router();

v2Router.get("/", v2Controller.getAllCountries);
v2Router.get("/:countryIdOrName", v2Controller.getCountryByIdOrName);
v2Router.get("/:countryIdOrName/states", v2Controller.getStatesByCountry);
v2Router.get(
    "/:countryIdOrName/state/:stateIdOrName",
    v2Controller.getStateByIdOrName,
);
v2Router.get(
    "/:countryIdOrName/state/:stateIdOrName/cities",
    v2Controller.getCitiesByCountryAndState,
);
v2Router.get("/:countryIdOrName/state/:stateIdOrName/city/:cityIdOrName");
v2Router.get("/between/:lat1/:lon1/:lat2/:lon2");
v2Router.get("/cities/between/:lat1/:lon1/:lat2/:lon2");
v2Router.get("/within/:distanceAmount/:distanceUnit");
v2Router.get("/cities/within/:distanceAmount/:distanceUnit");
