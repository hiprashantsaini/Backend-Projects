const mongoose=require("mongoose")

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    mobile:{
        type:String,
        required:true
    },
    image:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_admin:{
        type:Number,// 0 for user and 1 for admin
        required:true
    },
    is_varified:{
        type:Number,
        default:0 //Because in starting he will be user
    },
    token:{
        type:String,
        default:''
    }
})

module.exports=mongoose.model('User',userSchema)