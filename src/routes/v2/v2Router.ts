import express from "express";

export const v2Router = express.Router();

v2Router.get("/", (_req, res) => {
    res.send({ message: "v2 working" }).status(200);
});
v2Router.get("/cities");
v2Router.get("/city/distance");
v2Router.get("/countries");
v2Router.get("/country");
v2Router.get("/country/distance");
v2Router.get("/flag/image");
v2Router.get("/random");
v2Router.get("/states");
