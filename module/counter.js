import mongoose from "mongoose";


const Counter = mongoose.model('Counter', new mongoose.Schema({
  name: {type:String,default:"globalCounter"},
  seq: {type:Number,default:0}
}));


async function incrementCounter() {
  const result = await Counter.findOneAndUpdate(
    { name: 'globalCounter' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return result.seq;
}

export{incrementCounter}