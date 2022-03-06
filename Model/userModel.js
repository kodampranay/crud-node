import mongoose from "mongoose";


// create schema

const userSchema=mongoose.Schema({
    email:
    {
        type:String,
        require:true,
        unique:true
    },
    password:{
        type:String,
        require:true
    },
    otp:Number,
    date:{
        type:Date,
        default: Date.now()
    }
    ,
    status:{
        type:Boolean,
        default:false
    }
})

// creating model

 const Usermodel=new mongoose.model('user',userSchema);
// const objData=Usermodel({
//      email:'pranay@gmail.com',
//      password:'hashing123'
//  })
//  objData.save();

 export default Usermodel