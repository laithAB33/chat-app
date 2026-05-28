
import {asyncWrapper} from '../middlewares/asyncWrapper.js';
import { User } from '../module/userSchema.js';
import bcryptjs from "bcryptjs";
import { assignUser } from '../utils/assignObject.js';
import { genrateToken } from '../utils/genrateToken.js';
import { AppError } from '../utils/appError.js';
import { authentication } from '../utils/authentication.js';
import jwt from "jsonwebtoken";
import { uploadToCloudinary } from '../utils/cloudinary.js';
import { cloudinary } from '../utils/cloudinary.js';

let register = asyncWrapper(async (req, res, next) => {

    let {userName,password} = req.body;

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
            user:user.getMyData(),
            accessToken,
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
        user:oldUser.getMyData(),
        accessToken,
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
        user:foundUser.getMyData(),
        accessToken,
    }});

})

let update = asyncWrapper(async(req,res,next)=>{

    let data = req.body,photo;

    let user = await User.findOne({_id:req.userId});

    if(!user) return next(new AppError("user not found",400,"fail"));

    if(data.deleteImage == 'true')
    {
        if(user.profileImage.public_id)
        await cloudinary.uploader.destroy(user.profileImage.public_id);
        user.profileImage.url = null;
        user.profileImage.public_id = null;
    }
    
    if(data.email) user.email = data.email;
    if(data.phoneNumber) user.phoneNumber = data.phoneNumber;
    if(data.firstName) user.firstName = data.firstName;
    if(data.lastName) user.lastName = data.lastName;

    await user.save();

    res.status(200).json({success:true,status:"success",message:"the user was updated",
        data:{
            user:user.getMyData(),
        }});

})

let addAvatar = asyncWrapper(async(req,res,next)=>{

    if(!req.file) return next(new AppError("Please provide a picture of the item",400,"fail"));

    let photo;

    try{ photo = await uploadToCloudinary(req) }
    catch(err)
    {
        return next(new AppError("error uploading image",500,"error"));
    }

    let user = await User.findOneAndUpdate({_id:req.userId},{
        profileImage: {
            url:photo.url,
            public_id:photo.public_id,  
    }})

    if(!user) return next(new AppError("user not found",400,"fail"));

    let profileImage = user.profileImage;
    if(profileImage?.public_id)await cloudinary.uploader.destroy(profileImage.public_id);

    res.status(200).json({success:true, status:"success", message:"added a profileImage",
    data:{
        userId:req.userId,
        imageURL:photo.url
    }})

})

let searchUser = asyncWrapper(async(req,res,next)=>{

    let {userName} = req.query;

    if(!userName) return next(new AppError("userNameis missing",400,"fail"));

    let user = await User.findOne({userName});

    if(!user) return next(new AppError("user with this userName not found",404,"fail"));

    res.json({success:true, status:"success", message:"user info",
    data:{
        user:user.getUserData(),
    }});

})

let changePrivacySettings = asyncWrapper(async(req,res,next)=>{

    let {firstName,lastName,phoneNumber,email,userName,profileImage,lastSeen} = req.body;

    let user = await User.findById(req.userId);

    if(!user) return next(new AppError("user not found",400,"fail"));

    if(firstName) user.privacySettings.firstName = firstName;
    if(lastName) user.privacySettings.lastName = lastName;
    if(phoneNumber) user.privacySettings.phoneNumber = phoneNumber;
    if(email) user.privacySettings.email = email;
    if(userName) user.privacySettings.userName = userName;
    if(profileImage) user.privacySettings.profileImage = profileImage;
    if(lastSeen) user.privacySettings.lastSeen = lastSeen;

    await user.save();

    res.status(200).json({success:true, status:"success", message:"updated privacy settings",
    data:{
        userId:req.userId,
        privacySettings:user.privacySettings,
    }});

});

export {register, login,refreshToken,update,addAvatar,searchUser,changePrivacySettings};