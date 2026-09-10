import {socketControllerWrapper} from "../middlewares/asyncWrapper.js";
import {User} from "../module/userSchema.js";
import {AppError} from "../utils/appError.js";
import { PrivateMessage } from "../module/messageSchema.js";
import {io} from "../main.js";
import { redis, getCachedUserData } from "../utils/redis.js";

let  sendPrivateMessage = (socket,user)=> socketControllerWrapper(socket,async(data)=>{

    let {message,receiverId} = data, senderId = socket.userId;

    if(!message || !receiverId) throw new AppError("message and receiverId are required",400,"fail");

    if(String(senderId) == String(receiverId)) throw new AppError("you can't send message to yourself",400,"fail");

    let receiverSocketId = await redis.get(`socketId:${receiverId}`);

    let receiverCachedData = await getCachedUserData(receiverId);
    
    let privateMessage = new PrivateMessage({senderId,receiverId,message});

    await privateMessage.save();

    socket.emit("messageSent",{
        message:privateMessage.message,
        privateMessageId:privateMessage._id,
        sender:{
            id:senderId,
            senderUserName:user.userName,
            deviceToken:user.deviceToken,
            profileImage:user.profileImage.url
        },      
        receiver:{
            id:receiverId,
            receiverUserName:receiverCachedData .userName,
            deviceToken:receiverCachedData .deviceToken,
            profileImage:receiverCachedData .profileImage
        },
        createdAt:privateMessage.createdAt,
        delivered:false
    })

    io.to(receiverSocketId).emit("newMessage",{
        message:privateMessage.message,
        privateMessageId:privateMessage._id,
        sender:{
            id:senderId,
            senderUserName:user.userName,
             deviceToken:user.deviceToken,
             profileImage:user.profileImage.url
        },   
        receiver:{
            id:receiverId,
            receiverUserName:receiverCachedData.userName,
            deviceToken:receiverCachedData.deviceToken,
            profileImage:receiverCachedData.profileImage
        },
        createdAt:privateMessage.createdAt,
    })
})

let confirmPrivateMessageDelivery = (socket,receiver)=> socketControllerWrapper(socket,async(data)=>{

    let {messageId} = data, receiverId = socket.userId;

    if(!messageId) throw new AppError("messageId is required",400,"fail");

    let privateMessage = await PrivateMessage.findById(messageId);

    if(!privateMessage) throw new AppError("message not found",404,"fail");

    if(String(privateMessage.receiverId) !== String(receiverId)) throw new AppError("you are not the receiver of this message",400,"fail");

    let senderCachedData = await getCachedUserData(privateMessage.senderId);

    
    if(privateMessage.delivered) throw new AppError("message already delivered",400,"fail");

    privateMessage.delivered = true;

    await privateMessage.save();

    let senderId = privateMessage.senderId;

    let senderSocketId = await redis.get(`socketId:${privateMessage.senderId}`);

    io.to(senderSocketId).emit("messageDelivered", {
        message:privateMessage.message,
        privateMessageId:privateMessage._id,
        sender:{
            id:senderId,
            senderUserName:senderCachedData.userName,
            deviceToken:senderCachedData.deviceToken,
            profileImage:senderCachedData.profileImage
        },      
        receiver:{
            id:receiverId,
            receiverUserName:receiver.userName,
            deviceToken:receiver.deviceToken,
            profileImage:receiver.profileImage
        },
        createdAt:privateMessage.createdAt,
        delivered:true
    } );
})

export {sendPrivateMessage, confirmPrivateMessageDelivery};

// task : send message and confirm delivery