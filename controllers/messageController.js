import {AppError} from "../utils/appError.js";
import {isInteger} from "../utils/validate.js";
import { PrivateMessage } from "../module/messageSchema.js";
import { asyncWrapper } from "../middlewares/asyncWrapper.js";
import validator from "validator";


let getAllMessages = asyncWrapper(async(req,res,next)=>{

    let {limit, page} = req.query;

    let userId = req.params.userId;

    if(!userId) return next(new AppError("userId is required",400,"fail"));

    if(!isInteger(limit) || !isInteger(page)) return next(new AppError("limit and page must be integers",400,"fail"));

   let messages = await PrivateMessage.find({
    $or:[
        {senderId:req.userId,receiverId:userId},
        {senderId:userId,receiverId:req.userId}
    ]
   }).sort({createdAt:-1}).skip((page-1)*limit).limit(limit);
   

    res.status(200).json({success:true,status:"success",message:"all messages",data:{messages}});
    
})


let newMessages = asyncWrapper(async(req,res,next)=>{

    let date = req.params.date;

    if(!date) return next(new AppError("date is required",400,"fail"));


    if(!validator.isISO8601(date)) return next(new AppError("date must be in ISO 8601 format",400,"fail"));


    date = new Date(date);

    if(isNaN(date.getTime())) return next(new AppError("Invalid date",400,"fail"));
    
    let newMessages = await PrivateMessage.find({
        receiverId:req.userId,
        createdAt:{$gt:date}
    }).populate("senderId","userName").populate("receiverId","userName").sort({createdAt:-1});

    for(let message of newMessages)
    {
        message.delivered = true;
        await message.save();
    }

    res.status(200).json({success:true,status:"success",message:"new messages",data:{newMessages}});

})

export {getAllMessages, newMessages};