const userModel = require('../models/userModel')
const bcrypt = require('bcryptjs')
const nodemailer = require('nodemailer')
const { assign } = require('nodemailer/lib/shared')
const randomstring=require('randomstring')
const config=require('../config/config')

const securePassword = async (password) => {
     try {

          const passwordHash = await bcrypt.hash(password, 10)//10 is salt value that is used to add additional randomness to the hashed output
          return passwordHash;

     } catch (error) {
          console.log(error.message)
     }
}

// for send mail 
const sendVerifyMail = async (name, email, user_id) => {
     try {

          const transporter = nodemailer.createTransport({
               host: 'smtp.gmail.com',
               port: 587,
               secure: false,
               requireTLS: true,
               auth: {
                    user: config.emailUser,//your email
                    pass: config.emailPassword//generated from app password in gmail or google smtp
               }
          });
          const mailOptions = {
               from: config.emailUser,
               to: email,
               subject: 'For Verification mail',
               html: `<p>Hii ${name}, please click here to <a href="http://127.0.0.1:8080/verify?id=${user_id}">Verify</a> your mail</p>`
          }
          transporter.sendMail(mailOptions, function (error, info) {
               if (error) {
                    console.log(error)
               } else {
                    console.log('Email has been send:- ', info.response)
               }
          })

     } catch (error) {
          console.log(error.message)
     }
}

// for reset password send email 
const sendResetPasswordMail = async (name, email, token) => {
     try {

          const transporter = nodemailer.createTransport({
               host: 'smtp.gmail.com',
               port: 587,
               secure: false,
               requireTLS: true,
               auth: {
                    user: config.emailUser,//your email
                    pass: config.emailPassword//generated from app password in gmail or google smtp
               }
          });
          const mailOptions = {
               from: config.emailUser,
               to: email,
               subject: 'For reset password',
               html: `<p>Hii ${name}, please click here to <a href="http://127.0.0.1:8080/forget-password?token=${token}">Reset</a> your password</p>`
          }
          transporter.sendMail(mailOptions, function (error, info) {
               if (error) {
                    console.log(error)
               } else {
                    console.log('Email has been send:- ', info.response)
               }
          })

     } catch (error) {
          console.log(error.message)
     }
}

const loadRegister = async (req, res) => {
     try {
          res.render('registration');
     } catch (err) {
          console.log(err.message)
     }
}

let insertUser = async (req, res) => {
     try {
          const spassword = await securePassword(req.body.password)
          const user = userModel({
               name: req.body.name,
               email: req.body.email,
               mobile: req.body.mobile,
               image: req.file.filename,
               password: spassword,
               is_admin: 0,

          })
          const userData = await user.save();
          if (userData) {
               sendVerifyMail(req.body.name, req.body.email, userData._id);
               res.render('registration', { message: "Your registration has been successfull. Please verify your mail" })
          } else {
               res.render('registration', { message: "Your registration has been failed" })
          }
     } catch (err) {
          res.status(400).send("Here !" + err.message);
          console.log(err.message)
     }
}


const verifyMail = async (req, res) => {

     try {

          const updatedInfo = await userModel.updateOne({ _id: req.query.id }, { $set: { is_varified: 1 } });
          console.log(updatedInfo);
          res.render("email-verified")

     } catch (error) {
          console.log(error.message)
     }

}

//login user method started
const loginLoad = async (req, res) => {
     try {
          res.render('login');
     } catch (error) {
          console.log(error.message);
     }
}

const verifyLogin = async (req, res) => {
     try {
          email=req.body.email;
          password=req.body.password;
          console.log(email)
          userData = await userModel.findOne({ "email":email})
          if (userData) {
               console.log(userData)
               const passwordMatch =await bcrypt.compare(password, userData.password);
               console.log(passwordMatch)
               if (passwordMatch) {
                    if (userData.is_varified === 0) {
                         res.render('login', { message: "Please verify your email" })
                    } else {
                         console.log("session",req.session.user_id)
                         req.session.user_id= userData._id;
                         console.log("session-id",req.session.user_id)
                         res.redirect('/home')//Send the client on new url
                         // res.render('home')// send the home view
                    }
               } else {
                    res.render('login', { message: "Email and Password is incorrect" })
               }
          } else {
               res.render('login', { message: "Email and Password is incorrect" })
          }

     } catch (error) {
          console.log(error.message);

     }
}

const loadHome = async (req, res) => {
     try {
          const userData=await userModel.findById({_id:req.session.user_id})
          res.render('home',{user:userData});
     } catch (error) {
          console.log(error.message);
     }
}

const userLogout=async(req,res)=>{
     try {
          req.session.destroy();
          res.redirect('/');
     } catch (error) {
          console.log(error.message)
     }
}

// forget password code start 
const forgetLoad=async(req,res)=>{
     try {
          
         res.render('forget')

     } catch (error) {
         console.log(error.message) 
     }
}

const forgetVerify=async(req,res)=>{
     try {
          const email=req.body.email;
          const userData=await userModel.findOne({email:email});
          if(userData){
              if(userData.is_varified===0){
               res.render('forget',{message:"Please verify your email"})
              }else{
               const randomString=randomstring.generate();
               const updatedData=await userModel.updateOne({email:email},{$set:{token:randomString}});
               sendResetPasswordMail(userData.name,userData.email,randomString);
               res.render('forget',{message:"Please check your email to reset your password"})

              }

          }else{
               res.render('forget',{message:"User email is incorrect!"})
          }
     } catch (error) {
         console.log(error.message) 
     }
}

const forgetPasswordLoad=async(req,res)=>{
     try {
          const token=req.query.token;
          const tokenData=await userModel.findOne({token:token})
          if(tokenData){
               res.render('forget-password',{user_id:tokenData._id});
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
          const user_id=req.body.user_id;
          const secure_password=await securePassword(password)  
          const updatedData=await userModel.findByIdAndUpdate({_id:user_id},{$set:{password:secure_password,token:''}})
          res.redirect('/')
     } catch (error) {
          console.log(error.message)
     }
}

//for verification send mail link
const verificationLoad=async(req,res)=>{
     try {
          res.render('verification')
     } catch (error) {
          console.log(error.message)
     }
}

const sendVerificationLink=async(req,res)=>{
     try {
          
          const email=req.body.email;
          const userData=await userModel.findOne({email:email})
          if(userData){
            
               sendVerifyMail(userData.name,userData.email,userData._id);
               res.render('verification',{message:"Reset verification mail sent on your email id, please check"})

          }else{
               res.render('verification',{message:"This email is not exist!"})
          }

     } catch (error) {
          console.log(error.message)
     }
}


// user profile edit and update 
const editLoad=async(req,res)=>{
     try {
          
          const id=req.query.id;
          const userData=await userModel.findById({_id:id})
          if(userData){
                res.render('edit',{user:userData})
          }else{
               res.redirect('/home')
          }

     } catch (error) {
          console.log("Problem is here",error.message)
     }

}

const updateProfile=async(req,res)=>{
     try {
          let name=req.body.name;
          let email=req.body.email;
          let mobile=req.body.mobile;
          //Here filename will not define when we will not enter image for updataion. So don't define here "let image=req.file.filename;"
          if(req.file){
               let image=req.file.filename;
               const userData=await userModel.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:name,email:email,mobile:mobile,image:image}})
          }else{
               const userData=await userModel.findByIdAndUpdate({_id:req.body.user_id},{$set:{name:name,email:email,mobile:mobile}})
          }
          res.redirect('/home')
     } catch (error) {
          console.log(error.message);
     }
}

module.exports = {
     loadRegister,
     insertUser,
     verifyMail,
     loginLoad,
     verifyLogin,
     loadHome,
     userLogout,
     forgetLoad,
     forgetVerify,
     forgetPasswordLoad,
     resetPassword,
     verificationLoad,
     sendVerificationLink,
     editLoad,
     updateProfile
}