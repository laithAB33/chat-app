import mongoose,{Schema} from "mongoose";

const privateMessageSchema = new Schema({
    senderUserName: {
        type: String,
        ref: 'User',
        required: true
    },
    receiverUserName: {
        type: String,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'file','system'],
        default: 'text'
    },
    fileUrl: {
        url:{
            type:String,
            default:null,
        },
        public_id:{
            type:String,
            default:null,
        }
    },
    delivered:{
        type:Boolean,
        default:false
    }
}, {
    timestamps: true
});

let PrivateMessage = mongoose.model('privateMessage', privateMessageSchema);

export{PrivateMessage};