import { Router } from "express";
import { login, signUp } from "../controller/Auth.js";
import { validateSchema } from "../middleware/validateSchema.js";
import { schemaUser } from "../model/authSchema.js";

const authRoute = Router();

authRoute.post("/login", login);
authRoute.post("/cadastro", validateSchema(schemaUser), signUp);

export default authRoute;
