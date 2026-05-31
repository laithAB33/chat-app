import { socketWrapper } from "../middlewares/asyncWrapper.js";
import { sendMessage } from "../socket/messageController.js";
import {User} from "../module/userSchema.js";

let socketHandler = socketWrapper(async (socket) => {

    let user = await User.findById(socket.userId);

    user.socketId = socket.id;

    await user.save();
  
    socket.on('sendMessage', sendMessage(socket))
    
    
})

export {socketHandler};