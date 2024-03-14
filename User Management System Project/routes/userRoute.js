const express=require('express')
let user_route=express();
const session=require('express-session')

const config=require('../config/config')

user_route.use(session({secret:config.sessionSecret}))

const auth=require('../middleware/auth')

user_route.use(express.urlencoded({extended:true}))

user_route.set('view engine','ejs')
user_route.set('views','./views/users')


const multer=require('multer');
const path=require('path')

user_route.use(express.static('public'))

const storage=multer.diskStorage({

          destination:function(req,file,cb){
            cb(null,path.join(__dirname,'..','/public/userImages'));
          },
          filename:function(req,file,cb){
            let name=Date.now()+'-'+file.originalname;
            cb(null,name);
          }
        })

const upload=multer({storage:storage});

user_route.get('/',(req,res)=>{
  res.render('publicPage')
})

let userController=require('../controllers/userController');
user_route.get('/register',auth.isLogout,userController.loadRegister);
user_route.get('/home',auth.isLogin,userController.loadHome); 



user_route.post('/register',upload.single('image'),userController.insertUser)

user_route.get('/verify',userController.verifyMail)

user_route.get('/login',auth.isLogout,userController.loginLoad)// When click on login in home page menubar
user_route.post('/login',userController.verifyLogin)//When submit login form

user_route.get('/logout',auth.isLogin,userController.userLogout)

user_route.get('/forget',auth.isLogout,userController.forgetLoad);

user_route.post('/forget',userController.forgetVerify);

user_route.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);

user_route.post('/forget-password',userController.resetPassword);

user_route.get('/verification',userController.verificationLoad);
user_route.post('/verification',userController.sendVerificationLink);

user_route.get('/edit',auth.isLogin,userController.editLoad);
user_route.post('/edit',upload.single('image'),userController.updateProfile);


module.exports=user_route;