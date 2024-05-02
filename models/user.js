const mongoose=require('mongoose');

const userSchema=mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    token:{
        type:String,
        default:''
    }
})

const user=mongoose.model('user',userSchema);

module.exports=user;