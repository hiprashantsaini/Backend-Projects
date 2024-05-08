const mongoose=require('mongoose');

const postSchema=mongoose.Schema({
    post:{
        type:String,
        require:true
    },
    image:{
        type:String,
        default:''
    },
    comments:[{
         type:String,
    }],
    like:{
        type:Number,
        default:0
    },
    userId:{
        type:String,
        ref:'user',
        required:true
    }
})

const post=new mongoose.model('post',postSchema);

module.exports=post;