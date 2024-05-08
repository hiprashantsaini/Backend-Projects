const post = require('../models/post');
const postModel=require('../models/post');
const createPost=async(req,res)=>{
    try {
        console.log(req.body,req.userId)
        const post=req.body.post;
        const image=req.file.filename;
        const newPost=new postModel({
            post:post,
            image:image,
            userId:req.userId
        })
        const data=await newPost.save();
        res.send({msg:"Post has beeen created successfully!",data:data});

    } catch (error) {
        console.log("createPost",error.message);
        res.send({msg:"Internal server error",error});
    }
}

//read posts
const readPosts=async(req,res)=>{
    try {
        const posts=await postModel.find({}).populate('userId');
        res.send(posts);
    } catch (error) {
        console.log("readPost",error.message);
        res.send({msg:"Internal server error",error});
    }
}

//delete post
const deletePost=async(req,res)=>{
    try {
        const userId=req.userId;
        console.log()
        const data=await postModel.deleteOne({userId:userId});
        res.send({"msg":"post is deleted",data:data});
    } catch (error) {
        console.log("readPost",error.message);
        res.send({msg:"Internal server error",error});
    }
}

//update post
const updatePost=async(req,res)=>{
    try {
        const userId=req.userId;
        const postId=req.body.postId;
        const post=req.body.post;
        const image=req.file?.filename;
        console.log(post,image)
        const data=await postModel.findByIdAndUpdate({_id:postId},{$set:{post:post,image:image}},{new:true});
        res.send({"msg":"post is updated",data:data});
    } catch (error) {
        console.log("readPost",error.message);
        res.send({msg:"Internal server error",error});
    }
}

//like on posts
const likeOnPost=async(req,res)=>{
    try {
        let {postId,like}=req.body;
        const post=await postModel.findById({_id:postId});
        like=Number.parseInt(like);
        post.like+=like;
        const savedpost=await post.save();
        res.json(savedpost);
    } catch (error) {
        console.log("likeOnPost",error.message);
        res.send({msg:"Internal server error",error});
    }
}

// comment on post
const commentOnPost=async(req,res)=>{
    try {
        const {comment,postId}=req.body;
        const post=await postModel.findById({_id:postId});
        post.comments.push(comment);
        const savedpost=await post.save();
        console.log(savedpost,savedpost.comments[1])
        res.json(savedpost);
    } catch (error) {
        console.log("commentOnPost",error.message);
        res.send({msg:"Internal server error",error});
    }
}

module.exports={
    createPost,
    readPosts,
    deletePost,
    updatePost,
    likeOnPost,
    commentOnPost
}