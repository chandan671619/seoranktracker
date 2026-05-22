import mongoose from "mongoose";
const userSchema = new mongoose.Schema({
    name :{type:String, required:true , trim:true},
    email :{type:String, required:true , unique:true , lowercase:true , trim:true},
    password :{type:String, required:true,minlength:6},
    plan :{type:String,enum:["free","pro"], default:"free"},
    analysicscount : {type:Number, default:0},
    lastanalysisdate :{type:Date, default:null},
},{timestamps:true});

const User = mongoose.model("user", userSchema);
export default User;