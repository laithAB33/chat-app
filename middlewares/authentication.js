import {OAuth2Client} from "google-auth-library";
import {AppError} from "../utils/appError.js";
import { asyncWrapper } from "./asyncWrapper.js";

let verifyGoogleToken = asyncWrapper(async (req, res, next) => {

    let client = new OAuth2Client(process.env.client_id);

    let {idToken} = req.body;

    console.log(idToken);
    console.log(process.env.client_id);

    if(!idToken) return next(new AppError("idToken is required", 400,"fail"));

    let ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.client_id,})

    let payload = ticket.getPayload();

    console.log(payload);

    let {email_verified, name, email, sub} = payload;

    if(!email_verified) return next(new AppError("email is not verified", 400,"fail"));

    req.user = {email_verified, name, email, googleId:sub};

    next();
    

})

export {verifyGoogleToken};