import "dotenv/config";
import Express from "express";
import mongoose from "mongoose";

let 
app = Express(),
PORT = process.env.Port;

mongoose.connect(process.env.MONGODB_CONNECT_STR)
.then(()=>{
    console.log("mongodb connected successfly");
}).catch((err)=>{
    console.log("mongodb connection error",err);
})



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

