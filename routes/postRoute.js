const express=require('express');
const postController=require('../controller/post-controller');
const postRoute=express.Router();
const multer=require('multer');
const path=require('path');
const auth=require('../authentication/auth');


postRoute.use(express.urlencoded({extended:true}));

postRoute.use(express.json());



const storage=multer.diskStorage({
    destination:function(req,file,cb){
       cb(null,path.join(__dirname,'..','public/images'));
    },
    filename:function(req,file,cb){
        let name=Date.now()+'-'+file.originalname;
        cb(null,name)
    }
})

const upload=multer({storage:storage});

postRoute.post('/create',auth,upload.single('image'),postController.createPost);

//Read posts
postRoute.get('/read',postController.readPosts);

//Delete post
postRoute.post('/delete',auth,postController.deletePost);

//Update post
postRoute.put('/update',auth,upload.single('image'),postController.updatePost);

//like
postRoute.post('/like',postController.likeOnPost);

//comment on post
postRoute.post('/comment',postController.commentOnPost);

module.exports=postRoute;