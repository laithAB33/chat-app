import mongoose,{ Schema } from "mongoose";
import validator from "validator";

const {isEmail} = validator;

const userSchema = new Schema({
    firstName: {
        type: String,
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true,
    
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
        minLength: 12,
        sparse: true,
    
    },
    password: {
        type: String,
        minLength: 8,
    
    },
    phoneNumber: {
        type: String,
        unique: [true, "allready used phone number"],
        sparse: true,
    
    },
    profileImage: {
        url:{
            type:String,
            default:null,
        
        },
        public_id:{
            type:String,
            default:null,
        },
        
    },
    lastSeen: {
        type: Date,
        default: Date.now ,
    
    },
    provider:{
        type:[String],
        required:[true,"you need to Determine the access provider"],
        default:[],
    
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

    },

    privacySettings:{
        phoneNumber: {
            type: Boolean,
            default: false
        },
        email: {
            type: Boolean,
            default: false
        },
        profileImage: {
            type: Boolean,
            default: true
        },
        firstName:{
            type: Boolean,
            default: false
        },
        lastName: {
            type: Boolean,
            default: false
        },
        userName: {
            type: Boolean,
            default: true,
        },
        lastSeen: {
            type: Boolean,
            default: true
        },

    }

}, {
    timestamps: true
});

userSchema.methods.getMyData = function(){
    return {
        firstName: this.firstName,
        lastName: this.lastName,
        userName: this.userName,
        email: this.email,
        phoneNumber: this.phoneNumber,
        profileImage: this.profileImage.url,
        contacts: this.contacts,
        privacySettings: this.privacySettings
    }
}

userSchema.methods.getUserData = function(){
    return {
        firstName: this.privacySettings.firstName ? this.firstName : null,
        lastName: this.privacySettings.lastName ? this.lastName : null,
        userName: this.privacySettings.userName ? this.userName : null,
        email: this.privacySettings.email ? this.email : null,
        phoneNumber: this.privacySettings.phoneNumber ? this.phoneNumber : null,
        profileImage: this.privacySettings.profileImage ? this.profileImage.url : null,
        lastSeen:this.privacySettings.lastSeen ? this.lastSeen : null,
    }
}



let User = mongoose.model('User', userSchema);


export{User}
