import express, { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
import { login, signUp } from "./controller/Auth.js";
import { postExtract, getExtract } from "./controller/Moves.js";
dotenv.config();

const app = express();
const PORT = 5000;
app.use(cors());
app.use(json());

app.post("/login", login);
app.post("/cadastro", signUp);
app.post("/extract", postExtract);
app.get("/extract", getExtract);

app.listen(PORT, () => console.log("Server ON"));
