import express from "express";
import {verifyGoogleToken} from "../middlewares/authentication.js";
import {googleAuth} from "../controlers/auth.js";

let router = express.Router();

router.post("/google", verifyGoogleToken, googleAuth);

export {router as authRoutes};