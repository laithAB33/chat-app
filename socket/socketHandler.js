import { socketWrapper } from "../middlewares/asyncWrapper.js";
import { sendMessage } from "../socket/messageController.js";
import {User} from "../module/userSchema.js";
import { redis } from "../utils/redis.js";
import { disconnect } from "./disconnect.js";

let socketHandler = socketWrapper(async (socket) => {

    let user = await User.findById(socket.userId);

    redis.set(`socketId:${socket.userId}`,socket.id);
  
    socket.on('sendMessage', sendMessage(socket,user))

    socket.on('disconnect',disconnect(socket,user));
    
    
})

export {socketHandler};