import "dotenv/config"
import Express from "express";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import {globalErrorHandler} from "./controllers/globalErrorHandler.js";
import {authRoutes} from "./Routes/authRouter.js";
import {userRoutes} from "./Routes/userRouter.js";
import {createServer} from "http";
import { Server } from 'socket.io';
import { socketAuth } from "./controllers/auth.js";
import { socketHandler } from "./socket/socketHandler.js";

let 
app = Express(),
PORT = process.env.Port,
httpServer = createServer(app),
io = new Server(httpServer, {
    cors: {
        origin: "*",
        credentials: true,
        allowedHeaders:["content-Type"],
        },
    transports: ['websocket', 'polling']
});

export {io};

mongoose.connect(process.env.MONGODB_CONNECT_STR)
.then(()=>{
    console.log("mongodb connected successfly");
}).catch((err)=>{
    console.log("mongodb connection error",err);
})

app.use(cors({credentials:true}));
app.use(Express.json());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);


io.use(socketAuth);

io.on('connection',socketHandler);

app.use(globalErrorHandler);

app.use((req,res)=> {
    res.status(404).json({
        success:false, 
        status:"fail", 
        message: "this resourse is not available", 
        data:null,
    });
})


httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

