import { Router } from "express";
import { login, signUp } from "../controller/Auth.js";

const authRoute = Router();

authRoute.post("/login", login);
authRoute.post("/cadastro", signUp);

export default authRoute;
