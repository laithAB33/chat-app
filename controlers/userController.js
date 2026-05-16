
import {asyncWrapper} from '../middlewares/asyncWrapper.js';
import { User } from '../module/userSchema.js';
import bcryptjs from "bcryptjs";
import { assignUser } from '../utils/assignObject.js';
import { genrateToken } from '../utils/genrateToken.js';
import { AppError } from '../utils/appError.js';
import { authentication } from '../utils/authentication.js';
import jwt from "jsonwebtoken";

let register = asyncWrapper(async (req, res, next) => {

    let {userName,password,email,phoneNumber} = req.body;

    let checkOld = await User.findOne({userName});

    if(checkOld)return next(new AppError("invalid username or password",400,"fail"));
    
    if(password.length <8)return next(new AppError("password too short",400,"fail"));

    let hashedPassword = bcryptjs.hashSync(password);

    let user = assignUser(req,hashedPassword);

        await user.save();

        let payload = {userId:user._id,userName:user.userName};
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
    
        res.status(201).json({success: true ,status:"success",message: "user created successflly" ,
        data:{
            id:user._id,
            userName:user.userName,
            accessToken
        }});
})

let login = asyncWrapper(async(req, res, next) => {

    let userName = req.query.userName, password = req.query.password;
   
    let oldUser = await User.findOne({userName,provider:{$in:["userName"]}});

    if(!oldUser){
        return next(new AppError("invalid username or password",400,"fail"));
    }

    await authentication(password,oldUser.password);

    let payload = {userId:oldUser._id,userName:oldUser.userName};
    const accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET");
    const refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");

    await oldUser.save();

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

    res.status(200).json({success: true ,status:"success",message: "user logged in successflly" ,
    data:{
        id:oldUser._id,
        userName:oldUser.userName,
        accessToken
    }})

})

let refreshToken = asyncWrapper(async(req,res,next)=>{

    if(!req.cookies?.refreshToken)
        return next(new AppError("Unauthorized. Please login to access this resource",401,"fail"));
    
    let oldRefreshToken = req.cookies.refreshToken;

    let decoded = jwt.verify(oldRefreshToken, process.env.REFRESH_TOKEN_SECRET);

    let foundUser = await User.findOne({_id:decoded.userId});
    
    if(!foundUser)
        return next(new AppError("Unauthorized",401,"fail"));
    
    req.userID = decoded.userId;
    req.email = decoded.email;
    req.userName = decoded.userName;

    let payload = {email:foundUser.email,userId:foundUser._id,userName:foundUser.userName};
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

    res.status(200).json({success:true,status:"success",message:"the session is updated successfully",
    data:{
        accessToken
    }});

})

export {register, login,refreshToken};