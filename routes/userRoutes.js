const express=require('express');
const userController=require('../controller/user-controller');

const router=express();
router.use(express.urlencoded({extended:true}));
router.use(express.json());

// register api
router.post('/register',userController.registration);

// login api
router.post('/login',userController.loginUser);

//forget password
router.post('/forget-password',userController.forgetPassword);

//reset password
router.post('/reset-password',userController.resetPassword);
module.exports=router;