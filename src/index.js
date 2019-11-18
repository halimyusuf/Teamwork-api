import express from "express";
import dotenv from "dotenv";
dotenv.config();
const app = express();
import * as route from "./routes/routes";
route.route(app);

const port = process.env.PORT || 4000;
const server = app.listen(port, () =>
    console.log(`app running on port ${port}`)
);

export default server;