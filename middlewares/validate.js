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
        console.log(data.phoneNumber);
         let phoneNumber = parsePhoneNumberFromString(data.phoneNumber);

         console.log(phoneNumber);
        if(!phoneNumber || !phoneNumber.isValid()) 
            return next(new AppError("not a valid phone number",400,"fail"));

    }
   
    if( data.email && !isEmail(data.email)) return next(new AppError("not a valid email",400,"fail"));

    if ((data.deleteImage != undefined && data.deleteImage != null) && data.deleteImage !== 'true' && data.deleteImage !== 'false')
        return next(new AppError("deleteImage must be a boolean value",400,"fail"));
    

    next();
})



export {userUpdateValidate};