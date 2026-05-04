import {OAuth2Client} from "google-auth-library";
import {AppError} from "../utils/appError.js";

let verifyGoogleToken = (req, res, next) => {

    let client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

    let {idToken} = req.body;

    if(!idToken) return next(new AppError("idToken is required", 400,"fail"));

    client.verifyIdToken({
        idToken: idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
    })
    .then((response) => {

        let {email_verified, name, email, sub } = response.payload;

        req.user = {email_verified, name, email, googleId:sub};
        
        next();
    })
    .catch((error) => {
        return next(new AppError("Invalid or expired token", 401,"fail"));
    });

}

export {verifyGoogleToken};