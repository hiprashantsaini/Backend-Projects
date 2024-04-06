const express=require("express");
const userRoute=express();
const userController=require('../controllers/user-controller');

const { check } = require('express-validator');
const auth = require("../authentication/auth");
const multer=require("multer");
const path=require("path");
const ejs=require("ejs");
userRoute.use(express.json());
userRoute.use(express.urlencoded({ extended: true }))
userRoute.use(express.static('public'))
var cookieParser = require('cookie-parser')
userRoute.use(cookieParser())

userRoute.set("view engine","ejs");
userRoute.set("views","./views/users");

userRoute.get('/',userController.loadIndex);

//login 
userRoute.get('/login',auth.isLogout,userController.loadLogin);
userRoute.post('/login',userController.login);

const passwordStrength = value => {
  if (!/(?=.*[a-zA-Z])(?=.*\d)(?=.*[@$!%^*?&])/.test(value)) {
      throw new Error('Password must contain at least one letter, one number, and one special character (@$!%^*?&)');
  }
  return true;
}

const storage=multer.diskStorage({
  destination:function(req,file,cb){
    cb(null,path.join(__dirname,"../public/userImages"));
  },
  filename:function(req,file,cb){
    const name=Date.now()+'-'+file.originalname;
    cb(null,name);
  }
})
const upload=multer({storage:storage});

//register
userRoute.get('/register',userController.loadRegister);
userRoute.post('/register',
[
    // Input validation
    check('name', 'Please enter a name').not().isEmpty(),
    check('email', 'Please enter a valid email').isEmail(),
    check('password', 'Please enter a password with 6 or more characters')
    .isLength({ min: 6 })
    .custom(passwordStrength)
  ],
  userController.registration);

//Edit or update user profile
userRoute.get('/edit-profile',userController.loadEditProfile);
userRoute.post('/edit-profile',upload.single('image'),userController.updateProfile);


//showAllCourses
userRoute.get('/show-courses',auth.isLogin,userController.showAllCourses);

//enroll in course
userRoute.get('/course-enroll',auth.isLogin,userController.enrollCourse);

//show enrolled courses
userRoute.get('/enrolled-courses',auth.isLogin,userController.showEnrolledCourse);

//load view for forget password
userRoute.get('/forget',auth.isLogout,userController.loadForget);
//verify mail and send link
userRoute.post('/forget',userController.forgetVerify);

// now send view for new password
userRoute.get('/forget-password',auth.isLogout,userController.forgetPasswordLoad);
// reset password
userRoute.post('/forget-password',userController.resetPassword);







module.exports=userRoute;

