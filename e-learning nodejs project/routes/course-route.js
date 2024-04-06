const express=require("express");
const courseController = require("../controllers/course-controller");
const courseRoute=express();
courseRoute.use(express.json());
courseRoute.set("view engine","ejs");
courseRoute.set("views","./views/users");

courseRoute.post('/add-course',courseController.addCourse);
courseRoute.get('/show-courses',courseController.showCourses);

module.exports=courseRoute;