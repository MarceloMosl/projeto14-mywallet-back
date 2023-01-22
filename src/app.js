import express, { json } from "express";
import cors from "cors";
import authRoute from "./Routes/Authroute.js";
import extractRoute from "./Routes/Extractroute.js";

const app = express();
const PORT = 5000;
app.use(cors());
app.use(json());

app.use([authRoute, extractRoute]);

app.listen(PORT, () => console.log("Server ON"));
