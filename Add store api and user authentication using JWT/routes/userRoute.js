const express = require('express')
const user_route = express();

user_route.use(express.json())
user_route.use(express.urlencoded({ extended: true }))

const user_controller=require("../controllers/userController");
const verifyToken = require('../middleware/auth');

const multer = require('multer')
const path = require('path')

user_route.use(express.static('public'));

const storage=multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/userImages'), function (error, success) {
            if (error) throw error
        });
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null,name,function (error, success) {
            if (error) throw error
        });
    }

})

const upload=multer({storage:storage})

user_route.post('/register',upload.single('image'),user_controller.registeruser);

user_route.post('/login',user_controller.loginUser);

user_route.get('/test',verifyToken,function(req,res){
    console.log(req.user)
    res.status(200).send({success:true,msg:"Authenticated"});

})

user_route.post('/update-password',verifyToken,user_controller.updatePassword);
user_route.post('/forget-password',user_controller.forgetPassword);

user_route.get('/reset-password',user_controller.resetPassword);



module.exports=user_route;