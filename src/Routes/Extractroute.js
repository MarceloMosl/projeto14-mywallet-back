import { Router } from "express";
import { postExtract, getExtract } from "../controller/Moves.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { schemaMovement } from "../model/extractSchema.js";

const extractRoute = Router();

extractRoute.post("/extract", validateSchema(schemaMovement), postExtract);
extractRoute.get("/extract", getExtract);

export default extractRoute;
