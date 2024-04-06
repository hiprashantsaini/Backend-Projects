const express=require("express");
const adminRoute=express();
adminRoute.use(express.json());
adminRoute.set('view engine','ejs');
adminRoute.set('views','./views/admin');

const adminController=require('../controllers/admin-controller');
const adminAuth = require("../authentication/adminauth");

//add admin in admins table
adminRoute.post('/add-admin',adminController.addAdmin);

//login
adminRoute.get('/login',adminAuth.isLogout,adminController.loadLogin);
adminRoute.post('/login',adminController.adminLogin);

//Show all users 
adminRoute.get('/users',adminAuth.isLogin,adminController.showAllUsers);


//Edit users
adminRoute.get('/edit-user',adminAuth.isLogin,adminController.loadEditUser);
adminRoute.post('/edit-user',adminController.updateUser);

// Delete user
adminRoute.get('/delete-user',adminAuth.isLogin,adminController.deleteUser);

//Show all courses
adminRoute.get('/courses',adminAuth.isLogin,adminController.showAllCourses);

//Add new course
adminRoute.get('/add-course',adminAuth.isLogin,adminController.loadAddCourse);
adminRoute.post('/add-course',adminController.addNewCourse);

//Delete course
adminRoute.get('/delete-course',adminAuth.isLogin,adminController.deleteCourse);

//Edit course
adminRoute.get('/edit-course',adminAuth.isLogin,adminController.loadEditCourse);
adminRoute.post('/edit-course',adminController.updateCourse);

//show all enrolled users
adminRoute.get('/enrolled-users',adminAuth.isLogin,adminController.showAllEnrolledUsers);







module.exports=adminRoute;
