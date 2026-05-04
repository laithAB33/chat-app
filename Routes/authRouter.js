import express from "express";
import {verifyGoogleToken} from "../middlewares/authentication.js";
import {googleAuth} from "../controlers/auth.js";
import {upload} from "../middlewares/multer.js";

let router = express.Router();

router.post("/google",upload.none(),verifyGoogleToken, googleAuth);

export {router as authRoutes};