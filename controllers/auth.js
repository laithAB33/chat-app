import {User} from "../module/userSchema.js";
import { genrateToken } from "../utils/genrateToken.js";
import {AppError} from "../utils/appError.js";
import {asyncWrapper, socketWrapper} from "../middlewares/asyncWrapper.js";
import jwt from "jsonwebtoken";
import { extractTokenFromSocket } from "../utils/extractToken.js";
import { setTokenCookie, setDeviceCookie } from "../utils/setCookies.js";
import { Session } from "../module/sessionSchema.js";
import {createSession, checkOldSession } from "../utils/Sessions.js";

let googleAuth = asyncWrapper(async(req, res,next) => {
    
    let { email, googleId} = req.user, {deviceToken} = req.body;

    let user = await User.findOne({googleId});

    if(!user)
    {

        user = new User({
            userName: `#${email.split("@")[0]}`,
            googleId,
            email,
            provider:["google"],
        });

    }

    user.deviceToken = deviceToken;

    await checkOldSession(req);

    await user.save();

    await createSession(user._id, req.headers['user-agent'], req.ip, process.env.SESSION_EXPIRE_TIME);

    let payload = {email:user.email,userId:user._id,userName:user.userName,sid:session.sid};
    const accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET");
    const refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");

    setTokenCookie(res,accessToken,refreshToken);

    setDeviceCookie(res,user._id);

    res.status(200).json({
    success: true ,status:"success",message: "user logged in successflly" ,
    data:{
            user:user.getMyData(),
            accessToken,
        }
    })    
    
})

let socketAuth = socketWrapper(async (socket, next) => {

    const token = extractTokenFromSocket(socket);

    if(!token)
        throw new AppError("you need to login",401,"fail");
 
    let decoded;
    
    try
    {
        decoded = jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
    }
    catch(err)
    {
        throw new AppError("you need to login",401,"fail");
    }
    
    let user = await User.findById(decoded.userId);

    if(!user)
    {
        throw new AppError("Unauthorized",401,"fail")
    }

    socket.userId = user._id;
    socket.userName = user.userName;
    socket.profileImage = user.profileImage.url;

    next();

})

export {googleAuth, socketAuth};