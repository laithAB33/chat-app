import { createClient } from 'redis';

const redis = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST,
        port: 11856
    }
});


export{redis};