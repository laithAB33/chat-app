import { User } from "../module/userSchema.js";

let assignUser = (req,hashedPassword)=>{

    let  {userName,email,phoneNumber}  = req.body;

    let newUser = new User({
        userName,
        password:hashedPassword,
        email,
        phoneNumber,
        provider:["userName"],
    })

    return newUser;
}

export {assignUser};