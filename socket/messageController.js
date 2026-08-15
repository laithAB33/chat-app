import {socketControllerWrapper} from "../middlewares/asyncWrapper.js";
import {User} from "../module/userSchema.js";
import {AppError} from "../utils/appError.js";
import { PrivateMessage } from "../module/messageSchema.js";
import {io} from "../main.js";
import { redis } from "../utils/redis.js";

let  sendMessage = (socket,user)=> socketControllerWrapper(socket,async(data)=>{

    let {message,receiverId} = data;

    let senderId = socket.userId, delivered = true;

    if(!message || !receiverId) throw new AppError("message and receiverId are required",400,"fail");

    if(String(senderId) == String(receiverId)) throw new AppError("you can't send message to yourself",400,"fail");

    let receiverSocketId = await redis.get(`socketId:${receiverId}`);

    let receiver = await User.findById(receiverId);

    if(!receiver) throw new AppError("receiver not found",404,"fail");

    if(!receiverSocketId) delivered = false;

    let privateMessage = new PrivateMessage({senderId,receiverId,message,delivered});

    await privateMessage.save();

    socket.emit("messageSent",{
        message:privateMessage.message,
        sender:{
            id:senderId,
            senderUserName:user.userName,
            deviceToken:user.deviceToken,
            profileImage:user.profileImage.url
        },      
        receiver:{
            id:receiverId,
            receiverUserName:receiver.userName,
            deviceToken:receiver.deviceToken,
            profileImage:receiver.profileImage.url
        },
        createdAt:privateMessage.createdAt,
        delivered
    })

    if(!receiverSocketId) return;

    io.to(receiverSocketId).emit("newMessage",{
        message:privateMessage.message,
                sender:{
            id:senderId,
            senderUserName:user.userName,
             deviceToken:user.deviceToken,
             profileImage:user.profileImage.url
        },   
        receiver:{
            id:receiverId,
            receiverUserName:receiver.userName,
            deviceToken:receiver.deviceToken,
            profileImage:receiver.profileImage.url
        },
        createdAt:privateMessage.createdAt,
    })
})


export {sendMessage};