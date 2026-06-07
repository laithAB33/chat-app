import { asyncWrapper } from "./asyncWrapper.js";
import {User} from "../module/userSchema.js";
import {AppError} from "../utils/appError.js";
import validator from "validator";
const {isEmail} = validator;
import {parsePhoneNumberFromString} from "libphonenumber-js";

let userUpdateValidate = asyncWrapper(async(req,res,next)=>{

    let data = req.body;


    if(data.phoneNumber)
    {

        let phoneNumber = parsePhoneNumberFromString(data.phoneNumber);

        if(!phoneNumber || !phoneNumber.isValid()) 
            return next(new AppError("not a valid phone number",400,"fail"));

    }
   
    if( data.email && !isEmail(data.email)) return next(new AppError("not a valid email",400,"fail"));
    
    if ((data.deleteImage != undefined && data.deleteImage != null) && data.deleteImage !== 'true' && data.deleteImage !== 'false')
        return next(new AppError("deleteImage must be a boolean value",400,"fail"));
    
    if(data.firstName && typeof data.firstName !== "string") return next(new AppError("firstName must be a string",400,"fail"));

    if(data.lastName && typeof data.lastName !== "string") return next(new AppError("lastName must be a string",400,"fail"));

    if(data.userName && typeof data.userName !== "string") return next(new AppError("userName must be a string",400,"fail"));

    if(data.userName && data.userName[0] == "#") return next(new AppError("userName must not start with #",400,"fail"));

    if(data.userName)
    {
        let user = await User.findOne({userName:data.userName});

        if(user) return next(new AppError("user with this userName already exists",400,"fail"));
    }


    next();
})

let userRegisterValidate = asyncWrapper(async(req,res,next)=>{

    let data = req.body;

    if(!data.userName) return next(new AppError("userName is required",400,"fail"));

    if(typeof data.userName !== "string") return next(new AppError("userName must be a string",400,"fail"));

    if(data.userName[0] == "#") return next(new AppError("userName must not start with #",400,"fail"));
    
    next();
})

let userUpdatePrivacySettingsValidate = asyncWrapper(async(req,res,next)=>{

    let data = req.body;

    if(data.firstName && (data.firstName !== 'true'  && data.firstName !== "false") ) return next(new AppError("firstName must be true or false",400,"fail"));

    if(data.lastName && (data.lastName != "true"  && data.lastName != "false") ) return next(new AppError("lastName must be true or false",400,"fail"));

    if(data.phoneNumber && (data.phoneNumber != "true"  && data.phoneNumber != "false") ) return next(new AppError("phoneNumber must be true or false",400,"fail"));

    if(data.email && (data.email != "true"  && data.email != "false") ) return next(new AppError("email must be true or false",400,"fail"));

    if(data.userName && (data.userName != "true"  && data.userName != "false") ) return next(new AppError("userName must be true or false",400,"fail"));

    if(data.profileImage && (data.profileImage != "true"  && data.profileImage != "false") ) return next(new AppError("profileImage must be true or false",400,"fail"));

    if(data.lastSeen && (data.lastSeen != "true"  && data.lastSeen != "false") ) return next(new AppError("lastSeen must be true or false",400,"fail"));

    console.log(222);
    
    next();
})

export {userUpdateValidate, userRegisterValidate,userUpdatePrivacySettingsValidate};