import mongoose from "mongoose";
const userCollection = 'users';

export const UserSchema = new mongoose.Schema({
    email:{type:String, required:true, max:30},
    password:{type:String, required:true, max:10}
    
})
export const users = mongoose.model(userCollection, UserSchema);