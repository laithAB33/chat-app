import mongoose from 'mongoose';
import {randomBytes} from 'crypto';

const sessionSchema = new mongoose.Schema({
  sid: {
    type: String,
    required: true,
    unique: true,

  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,   
  },
  deviceId:{
    type: String,
    required: true,
  },
  deviceInfo: {
    type: String,     
    default: null,
  },
  ip: {
    type: String,
    default: null,
  },
  isRevoked: {
    type: Boolean,
    default: false,

  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, { timestamps: true });

sessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

sessionSchema.index({ userId: 1, isRevoked: 1 });


const Session = mongoose.model('Session', sessionSchema);

export {Session};