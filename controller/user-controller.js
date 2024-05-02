const user = require("../models/user");
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const config=require('../config');
const nodemailer=require('nodemailer');
const randomstring=require('randomstring');
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

//User registration

const registration=async(req,res)=>{
    try {
        const {username,email,password}=req.body;
        const userData=await user.findOne({username:username});
        if(userData){
         return res.status(200).send({msg:"Username already exists"});
    
        }
        const spassword=await bcrypt.hash(password,10);
        const newuser=new user({
            username,
            email,
            password:spassword
        })
       const data= await newuser.save();
        console.log(data.username);
        res.send(data)
    } catch (error) {
        console.log(error)
    }

}

//login user
const loginUser=async(req,res)=>{
    try {
        console.log(req.body)
        const {username,password}=req.body;
        const userData=await user.findOne({username:username});
        if(!userData){
            return res.status(200).send({msg:"Username does not exists"});
        }else{
            const matchPass=await bcrypt.compare(password,userData.password);
            if(matchPass){
                const token=jwt.sign({id:userData._id,username:userData.username},config.SECRET_KEY);
               return res.status(200).json({mag:"You have been loggedin",userData,token}) ;
            }
            return res.status(200).send({mag:"Incorrect username or password"});
        }
    } catch (error) {
        console.log("loginUser",error.message);
        res.status(500).send({msg:"Server problem"});
    }
}

// forget password
const forgetPassword=async(req,res)=>{
    try {
        const {email}=req.body;
        const userData=await user.findOne({email:email});
        console.log(userData)
        if(!userData){
            return res.status(200).json({msg:"Incorrect mail"});
        }
        const token=randomstring.generate(7);
        sendResetPasswordMail(userData.username,email,token);
        await user.updateOne({email:userData.email},{$set:{token:token}});
        res.status(200).json({msg:"Check your mail",token});
    } catch (error) {
        console.log("forgetPassword:",error.message);
        res.status(500).json({mas:"Internal server error"});
    }
}


// reset password 
const resetPassword=async(req,res)=>{
    try {
        const { password, token } = req.body;
         console.log(token)
         const secure_password=await bcrypt.hash(password,10);  
         const userData=await user.findOne({token:token})
         console.log(userData)
         if (!userData) {
                   return res.status(404).json({ msg: "Invalid or expired token" });
        }
         const updatedData=await user.updateOne({token:token},{$set:{password:secure_password,token:''}})
         res.status(200).json({msg:"Your password has been updated!",updatedData});
    } catch (error) {
         console.log(error.message)
    }
}


module.exports={
    registration,
    loginUser,
    forgetPassword,
    resetPassword
}