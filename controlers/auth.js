import {User} from "../module/userSchema.js";
import { genrateToken } from "../utils/genrateToken.js";
import {AppError} from "../utils/appError.js";
import {asyncWrapper} from "../middlewares/asyncWrapper.js";


let googleAuth = asyncWrapper(async(req, res,next) => {
    
    let { email, googleId} = req.user;

    let user = await User.findOne({googleId});



    if(!user)
    {
        const newNumber = await incrementCounter(); 

        user = new User({
            userName: `#${newNumber}`,
            googleId,
            email,
            provider:["google"],
        });

        await user.save();
    }

    let payload = {email:user.email,userId:user._id}
    const accessToken = genrateToken(payload,"ACCESS_TOKEN_SECRET");
    const refreshToken = genrateToken(payload,"REFRESH_TOKEN_SECRET");

    await user.save();

    res.cookie("refreshToken",refreshToken,{
        maxAge:1000 * 60 * 60 *24 * 365 ,
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })

    res.cookie("accessToken",accessToken,{
        maxAge:1000 * 60 * 30,
        httpOnly:true,
        secure : process.env.NODE_ENV == 'production',
        samesite: 'strict',
    })

    res.status(200).json({
    success: true ,status:"success",message: "user logged in successflly" ,
    data:{
            id:user._id,
            accessToken
        }
    })    
    
})

export {googleAuth};