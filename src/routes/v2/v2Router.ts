import express from "express";

export const v2Router = express.Router();

v2Router.get("/");
v2Router.get("/:countryIdOrName");
v2Router.get("/:countryIdOrName/states");
v2Router.get("/:countryIdOrName/state/:stateIdOrName");
v2Router.get("/:countryIdOrName/state/:stateIdOrName/cities");
v2Router.get("/:countryIdOrName/state/:stateIdOrName/city/:cityIdOrName");
v2Router.get("/between/:lat1/:lon1/:lat2/:lon2");
v2Router.get("/cities/between/:lat1/:lon1/:lat2/:lon2");
v2Router.get("/within/:distanceAmount/:distanceUnit");
v2Router.get("/cities/within/:distanceAmount/:distanceUnit");
