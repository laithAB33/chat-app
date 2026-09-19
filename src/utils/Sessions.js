import {redis} from './redis.js';
import {Session} from '../module/sessionSchema.js';
import crypto from 'crypto';

let createSession = async function (OldDeviceId,userId, deviceInfo, ip, expiresIn) {

  let  expiresAt = Number(expiresIn) +  Date.now();
  
  let sid = crypto.randomBytes(32).toString('hex');

  let deviceId = OldDeviceId || crypto.randomBytes(32).toString('hex');

    const session = new Session({
      sid,
      deviceId,
      userId,
      deviceInfo,
      ip,
      expiresAt,
    });

    await session.save();


    await redis.hSet(`session:${sid}`, { deviceId:deviceId, userId:String(userId), deviceInfo:deviceInfo || "", ip:ip || "",expiresAt:expiresAt});
    
    await redis.expire(`session:${sid}`, expiresIn / 1000);
    
    return session;
}

let checkOldSession = async function (req) {

  let deviceId = req.cookies.deviceId;

  if(deviceId)
  {
    console.log(req.userId);
    
    let session = await Session.findOneAndDelete({ deviceId,userId: req.userId, isRevoked: false });

    if(session) await redis.del(`session:${session.sid}`);

  }

}

export { createSession, checkOldSession };