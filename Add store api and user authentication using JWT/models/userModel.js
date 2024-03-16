const mongoose=require('mongoose')
const user=mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        reqired:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
        default:''
    },
    image:{
        type:String,
        required:true
    },
    type:{
        type:Number,
        default:0 // 0 for user and 1 for vendor
    },
    mobile:{
        type:Number,
        required:true
    }

});

module.exports=mongoose.model('User',user);//User