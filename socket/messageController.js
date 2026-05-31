import {socketControllerWrapper} from "../middlewares/asyncWrapper.js";
import {User} from "../module/userSchema.js";
import {AppError} from "../utils/appError.js";
import { PrivateMessage } from "../module/messageSchema.js";
import {io} from "../main.js";

let  sendMessage = (socket)=> socketControllerWrapper(socket,async(data)=>{

    let {message,receiverId} = data;

    let senderId = socket.userId;

    if(!message || !receiverId) throw new AppError("message and receiverId are required",400,"fail");

    if(String(senderId) == String(receiverId)) throw new AppError("you can't send message to yourself",400,"fail");

    let receiver = await User.findById(receiverId);

    if(!receiver) throw new AppError("receiver not found",404,"fail");

    let privateMessage = new PrivateMessage({senderId,receiverId,message});
    
    await privateMessage.save();

    socket.emit("messageSent",{
        message:privateMessage.message,
        senderId,
        receiverId,
        createdAt:privateMessage.createdAt,
    })

    io.to(receiver.socketId).emit("newMessage",{
        message:privateMessage.message,
        senderId,
        receiverId,
        createdAt:privateMessage.createdAt,
    })

})


export {sendMessage};