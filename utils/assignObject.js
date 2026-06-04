import { User } from "../module/userSchema.js";

let assignUser = (req,hashedPassword)=>{

    let  {userName,email,phoneNumber}  = req.body;

    let newUser = new User({
        userName,
        password:hashedPassword,
        provider:["userName"],
        deviceToken:req.body.deviceToken,
    })

    return newUser;
}

export {assignUser};