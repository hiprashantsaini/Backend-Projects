const { validationResult } = require('express-validator');
const sql = require("../dataBase/connectdb");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { create_token } = require('../authentication/auth');
const {RESEND_API_KEY} = process.env;
const {Resend}=require("resend");
const resend = new Resend(RESEND_API_KEY);

const sendMail=async(email)=>{
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ['prashantsaini4499@gmail.com'],// to test
    subject: 'You are registered',
    html: '<strong>Your registration has been successful. Please login</strong>',
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}
//Send course enroll message;
const enrollMessage=async(email,courseId)=>{
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ['prashantsaini4499@gmail.com'],// to test
    subject: 'Course enrollment',
    html: `<strong>Your enrollment has been successful. Your course id is ${courseId}</strong>`,
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}

//send verify mail for password reset
const sendResetPasswordMail=async(email,userId)=>{
  const { data, error } = await resend.emails.send({
    from: 'onboarding@resend.dev',
    to: ['prashantsaini4499@gmail.com'],// to test
    subject: 'Reset password',
    html: `<p> please click here to <a href="http://127.0.0.1:8080/forget-password?userId=${userId}">Reset</a> your password</p>`
  });

  if (error) {
    return console.error({ error });
  }

  console.log({ data });
}
//Index page
const loadIndex = async (req, res) => {
  try {
    res.render('index');
  } catch (error) {
    console.log("loadIndex:", error.message);
    res.status(400).send(error.message);
  }
}
//load login page
const loadLogin = async (req, res) => {
  try {
    res.render('login');
  } catch (error) {
    console.log("loadLogin:", error.message);
    res.status(400).send(error.message);
  }
}

// User login and generate jwt token
const login = async (req, res) => {
  console.log(req.body)
  try {

    const { email, password } = req.body;
    const userData = await sql`
    select * from users where email=${email};
    `
    if (userData[0]) {
      const matchPassword = await bcrypt.compare(password, userData[0].password);
      if (matchPassword) {
        const token = await create_token(userData[0].id);
        // res.status(200).send({ success: true, data: userData[0], token: token })
        res.cookie('jwt', token);
        // res.send('Login successful');
        res.render('home', { user: userData[0] });
      } else {
        return res.status(200).send({ msg: "Email or password incorrect" });
      }
    } else {
      return res.status(200).send({ msg: "Email or password incorrect" });
    }

  } catch (error) {
    console.log("login:", error.message);
    res.status(400).send({ msg: error.message });
  }
}
//send registration mail


//load register form
const loadRegister = async (req, res) => {
  try {
    res.render('registration');
  } catch (error) {
    console.log("loadLogin:", error.message);
    res.status(400).send(error.message);
  }
}

const registration = async (req, res) => {
  console.log(req.body)
  // Check for validation errors
  const errors = validationResult(req);//validationResult(req) is a function provided by express-validator that extracts validation errors from the request object.
  if (!errors.isEmpty()) {
    console.log("registration:", errors.array()[0].msg)
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;
    const salt = await bcrypt.genSalt();
    const spassword = await bcrypt.hash(password, salt);
    const result = await sql`
      INSERT INTO users (name, email, password)
      VALUES (${name}, ${email}, ${spassword})
      RETURNING *;
    `;
    sendMail(email);
    console.log(result);
    res.status(200).send({ success: true, msg: result });
  } catch (error) {
    console.error("registration:", error.message);
    res.status(400).send({ msg: error.message });
  }
};

//Edit user profile
const loadEditProfile = async (req, res) => {
  try {

    const userId = req.query.id;
    const userData = await sql`
              SELECT * from users WHERE id=${userId};`
    res.render('edit', { user: userData[0] });

  } catch (error) {
    console.log("loadEditProfile:", error.message);
    res.status(400).send({ msg: error.message });
  }
}

//update profile
const updateProfile = async (req, res) => {
  try {
    let id = req.body.userId;
    let name = req.body.name;
    let email = req.body.email;
    //Here filename will not define when we will not enter image for updataion. So don't define here "let image=req.file.filename;"
    if (req.file) {
      let image = req.file.filename;
      const userData = await sql`
                     UPDATE users 
                     SET name=${name}, email=${email}, image=${image}
                     WHERE id=${id} RETURNING *;`
      console.log(userData[0]);
      res.render('home', { user: userData[0] });
    } else {
      const userData = await sql`
      UPDATE users 
      SET name=${name}, email=${email}
      WHERE id=${id} RETURNING *;`
      console.log(userData[0]);
      res.render('home', { user: userData[0] });
    }
  } catch (error) {
    console.log(error.message);
  }
}
//Show all courses
const showAllCourses = async (req, res) => {
  try {
     
      const allCourses=await sql`
             SELECT * from courses;`

      const user=await sql`
             SELECT * from users where id=${req.userId};`
      res.render("home",{courses:allCourses,user:user[0]});
  } catch (error) {
      console.log("showAllCourses:", error.message);
      res.status(400).send("Server is not responding!");
  }
}
//Enroll in course
const enrollCourse=async(req,res)=>{
  try {
      console.log(req.query.id,req.userId)
      // await sql`
      //      CREATE TABLE IF NOT EXISTS enrolled_Courses(
      //         Serial_no SERIAL PRIMARY KEY NOT NULL,
      //         courseId INTEGER UNIQUE,
      //         userId INT,
      //         FOREIGN KEY (userId) REFERENCES users(id)
      //      );`
      const data=await sql`
         INSERT INTO enrolled_Courses(courseId,userId)
         VALUES (${req.query.id},${req.userId});`
      const email=await sql`
      SELECT email from users where id=${req.userId};`
      console.log(email)
         enrollMessage(email,req.query.id);
         res.redirect('/user/login');
  } catch (error) {
      if(error.code=='23505'){// 23505 is the PostgreSQL error code for unique violation
        return res.render('23505',{message:error.message+" You have already enrolled in this course"})
      }
      console.log("enrollCourse:", error.message);
      res.status(400).send({ msg: error.message });
  }
}

//Show enrolled sourses enrolled by user
const showEnrolledCourse = async (req, res) => {
  try {
      const enrolledCourses = await sql`
      SELECT * from courses where course_id IN 
      (SELECT courseId from enrolled_Courses where userId = ${req.userId});
      `
      console.log("Enrolled courses:", enrolledCourses);

      res.render('enrolled-course',{courses:enrolledCourses});
  } catch (error) {
      console.log("showEnrolledCourse:", error.message);
      res.status(400).send("Server is not responding!");
  }
}
// load forget password form
const loadForget=async(req,res)=>{
  try {
    res.render('forget')
  } catch (error) {
    console.log("loadForget:", error.message);
    res.status(400).send(error.message);
  }
}

const forgetVerify=async(req,res)=>{
  try {
       const email=req.body.email;
       const userData=await sql`
       SELECT * from users where email=${email};`
       console.log(email,userData)
       if(userData[0]){
        console.log(userData)
            sendResetPasswordMail(email,userData[0].id);
            res.render('forget',{message:"Please check your email to reset your password"})

       }else{
            res.render('forget',{message:"User email is incorrect!"})
       }
  } catch (error) {
      console.log(error.message) 
  }
}

const forgetPasswordLoad=async(req,res)=>{
  try {
       const userId=req.query.userId;
       const userData=await sql`
       SELECT * from users where id=${userId};`
       if(userData[0]){
            res.render('forget-password',{user_id:userId});
       }else{
            res.render('404',{message:"Token is invalid!"})
       }
  } catch (error) {
       console.log(error.message);
  }
}

const resetPassword=async(req,res)=>{
  try {
       const password=req.body.password;
       const user_id=req.body.userId;
       const salt = await bcrypt.genSalt();
       const spassword = await bcrypt.hash(password, salt); 
       const updatedData=await sql`
            UPDATE users 
            SET password=${spassword}
            WHERE id=${user_id} RETURNING *;`
       res.redirect('/user/login')
  } catch (error) {
       console.log(error.message)
  }
}
module.exports = {
  loadRegister,
  registration,
  loadLogin,
  login,
  loadEditProfile,
  updateProfile,
  loadIndex,
  showAllCourses,
  enrollCourse,
  showEnrolledCourse,
  loadForget,
  forgetVerify,
  forgetPasswordLoad,
  resetPassword
};

