import {socketControllerWrapper} from "../middlewares/asyncWrapper.js";
import {User} from "../module/userSchema.js";
import {AppError} from "../utils/appError.js";
import { PrivateMessage } from "../module/messageSchema.js";
import {io} from "../main.js";
import { redis } from "../utils/redis.js";

let  sendMessage = (socket)=> socketControllerWrapper(socket,async(data)=>{

    let {message,receiverId} = data;

    console.log(socket.userId,data);

    let senderId = socket.userId, delivered = true;

    if(!message || !receiverId) throw new AppError("message and receiverId are required",400,"fail");

    if(String(senderId) == String(receiverId)) throw new AppError("you can't send message to yourself",400,"fail");

    let receiverSocketId = await redis.get(`socketId:${receiverId}`);

    if(!receiverSocketId) delivered = false;

    let privateMessage = new PrivateMessage({senderId,receiverId,message,delivered});
    
    await privateMessage.save();

    socket.emit("messageSent",{
        message:privateMessage.message,
        senderId,
        receiverId,
        createdAt:privateMessage.createdAt,
        delivered
    })

    if(!receiverSocketId) return;

    io.to(receiverSocketId).emit("newMessage",{
        message:privateMessage.message,
        senderId,
        receiverId,
        createdAt:privateMessage.createdAt,
    })
})


export {sendMessage};