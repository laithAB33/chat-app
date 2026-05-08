import { User } from "../module/userSchema.js";

let assignUser = (req,hashedPassword)=>{

    let {userName} = req.body;

    let newUser = new User({
        userName,
        password:hashedPassword,
        provider:["userName"],
    })

    return newUser;
}

export {assignUser};