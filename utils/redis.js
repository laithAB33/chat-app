import { createClient } from 'redis';
import { User } from '../module/userSchema.js';
import { AppError } from '../utils/appError.js';

const redis = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 11856
    }
});

async function getCacheData(key, value) {

    await redis.hSet(key, value);

    await redis.expire(key, 60 * 60 );
}

async function getCachedUserData(key)
{
    let cachedData = await redis.hGetAll(`userData:${key}`);

    if(!cachedData || Object.keys(cachedData).length === 0)
    {
        
        let storedData = await User.findById(key);

        if(!storedData) throw new AppError("user not found",404,"fail");

        cachedData = {
            userName:storedData.userName|| "",
            deviceToken:storedData.deviceToken|| "", 
            profileImage:storedData.profileImage?.url || ""
        }
        
            await getCacheData(`userData:${key}`,cachedData);

    }

    return cachedData;
}



export{redis,getCachedUserData};