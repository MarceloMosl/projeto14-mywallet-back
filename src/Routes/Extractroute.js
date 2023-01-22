import { Router } from "express";
import { postExtract, getExtract } from "../controller/Moves.js";

const extractRoute = Router();

extractRoute.post("/extract", postExtract);
extractRoute.get("/extract", getExtract);

export default extractRoute;
