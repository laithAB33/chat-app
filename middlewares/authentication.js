import {OAuth2Client} from "google-auth-library";
import {AppError} from "../utils/appError.js";
import { asyncWrapper } from "./asyncWrapper.js";

let verifyGoogleToken = asyncWrapper(async (req, res, next) => {

    let client = new OAuth2Client(process.env.CLIENT_ID);

    let {idToken} = req.body;

    if(!idToken) return next(new AppError("idToken is required", 400,"fail"));

    let ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.CLIENT_ID,})

    let payload = ticket.getPayload();

    let {email_verified,email, sub} = payload;

    if(!email_verified) return next(new AppError("email is not verified", 400,"fail"));

    req.user = {email, googleId:sub};

    next();
    

})

export {verifyGoogleToken};