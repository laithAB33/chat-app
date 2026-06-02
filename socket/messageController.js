import {socketControllerWrapper} from "../middlewares/asyncWrapper.js";
import {User} from "../module/userSchema.js";
import {AppError} from "../utils/appError.js";
import { PrivateMessage } from "../module/messageSchema.js";
import {io} from "../main.js";

let  sendMessage = (socket)=> socketControllerWrapper(socket,async(data)=>{

    let {message,receiverUserName} = data;

    console.log(message,receiverUserName);

    let senderUserName = socket.userName;

    if(!message || !receiverUserName) throw new AppError("message and receiverUserName are required",400,"fail");

    if(String(senderUserName) == String(receiverUserName)) throw new AppError("you can't send message to yourself",400,"fail");

    let receiver = await User.findOne({userName: receiverUserName});

    if(!receiver) throw new AppError("receiver not found",404,"fail");

    let privateMessage = new PrivateMessage({senderUserName,receiverUserName,message});
    
    await privateMessage.save();

    socket.emit("messageSent",{
        message:privateMessage.message,
        senderUserName,
        receiverUserName,
        createdAt:privateMessage.createdAt,
    })

    io.to(receiver.socketId).emit("newMessage",{
        message:privateMessage.message,
        senderUserName,
        receiverUserName,
        createdAt:privateMessage.createdAt,
    })

})


export {sendMessage};