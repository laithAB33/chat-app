import {OAuth2Client} from "google-auth-library";
import {AppError} from "../utils/appError.js";
import { asyncWrapper } from "./asyncWrapper.js";
import jwt from "jsonwebtoken";
import { Session } from "../module/sessionSchema.js";
import { redis } from "../utils/redis.js";

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

let verifyToken = async(req,res,next)=>{

    let token = req.cookies?.accessToken,deviceId = req.cookies?.deviceId;
    let decoded;

    try{
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    }catch(err){

            let error = new AppError("you need to sign up or sign in",401,"fail");
            return next(error);
    }

    let storedSid = await redis.hGetAll(`session:${decoded.sid}`);

    if(!storedSid || Object.keys(storedSid).length === 0)
    {
        storedSid = await Session.findOne({sid:decoded.sid});
    
        console.log(storedSid);
        

        if(!storedSid || storedSid.expiresAt < Date.now()) return next(new AppError("your session is expired",401,"fail"));

        await redis.hSet(`session:${decoded.sid}`, { deviceId: storedSid.deviceId,userId: String(storedSid.userId), deviceInfo: storedSid.deviceInfo||"", ip: storedSid.ip||"", expiresAt: String(storedSid.expiresAt) });
        
    }

    if(String(deviceId) != String(storedSid.deviceId)) return next(new AppError("you need to sign up or sign in",401,"fail"));
        
    req.userId = decoded.userId;
    req.email = decoded.email;
    req.userName = decoded.userName;
    next();
}


export {verifyGoogleToken, verifyToken};