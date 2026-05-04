import mongoose,{ Schema } from "mongoose";
import validator from "validator";
const {isEmail} = validator;

const userSchema = new Schema({
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    userName: {
        type: String,
        unique: [true, "allready used username"],
        trim: true,
        sparse: true,
    },
    email: {
        type: String,
        validate:{
            validator: isEmail,
            message: "this is not a valid email"
        },
        unique: [true, "invalid email or password"],
        minLength: 15,
        sparse: true,
    },
    password: {
        type: String,
    },
    phoneNumber: {
        type: String,
        unique: [true, "allready used phone number"],
        sparse: true
    },
    profileImage: {
        url:{
            type:String,
            default:null,
        },
        public_id:{
            type:String,
            default:null,
        }     
    },
    lastSeen: {
        type: Date,
        default: Date.now 
    },
    refreshToken:{
        type: String,
    },
    accessToken:{
        type:String,
    },
    provider:{
        type:[String],
        required:[true,"you need to Determine the access provider"],
        default:[]
    },
    contacts:{
    type:[
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }
    ],
    default:[],
    }

}, {
    timestamps: true
});

let User = mongoose.model('User', userSchema);


export{User}
