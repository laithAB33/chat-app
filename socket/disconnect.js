import {socketControllerWrapper} from "../middlewares/asyncWrapper.js";
import {User} from "../module/userSchema.js";
import {AppError} from "../utils/appError.js";
import { PrivateMessage } from "../module/messageSchema.js";
import {io} from "../main.js";
import { redis } from "../utils/redis.js";

let disconnect = (socket,user) => socketControllerWrapper(socket,async()=>{

    await redis.del(`socketId:${socket.userId}`);

    user.lastSeen = new Date();

    await user.save();
})

export {disconnect};