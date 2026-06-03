import {User} from "../module/userSchema.js";
import { genrateToken } from "../utils/genrateToken.js";
import {AppError} from "../utils/appError.js";
import {asyncWrapper, socketWrapper} from "../middlewares/asyncWrapper.js";
import jwt from "jsonwebtoken";
import { extractTokenFromSocket } from "../utils/extractToken.js";


let googleAuth = asyncWrapper(async(req, res,next) => {
    
    let { email, googleId} = req.user;

    let user = await User.findOne({googleId});

    if(!user)
    {

        user = new User({
            userName: `#${email.split("@")[0]}`,
            googleId,
            email,
            provider:["google"],
        });

        await user.save();
    }

    let payload = {email:user.email,userId:user._id,userName:user.userName}
    const accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET");
    const refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");

    res.cookie("refreshToken",refreshToken,{
        maxAge:1000 * 60 * 60 *24 * 365 ,
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })

    res.cookie("accessToken",accessToken,{
        maxAge:1000 * 60 * 30,
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })

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