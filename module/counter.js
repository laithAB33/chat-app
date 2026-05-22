import mongoose from "mongoose";


const Counter = mongoose.model('Counter', new mongoose.Schema({
  _id: String,
  seq: Number
}));


async function incrementCounter() {
  const result = await Counter.findOneAndUpdate(
    { _id: 'globalCounter' },
    { $inc: { seq: 1 } },
    { upsert: true, new: true }
  );
  return result.seq;
}

// الاستخدام
