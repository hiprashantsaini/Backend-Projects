const userModel = require('../models/userModel');
const config = require('../config/config');
const bcryptjs = require('bcryptjs')
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const randomstring = require('randomstring');


const securePassword = async (password) => {
    try {
        const passwordHash = await bcryptjs.hash(password, 10)
        return passwordHash;
    } catch (error) {
        res.status(400).send(error.message)
    }
}

const create_token = async (id) => {
    try {

        const token = await jwt.sign({ _id: id }, config.secret_jwt);
        return token;

    } catch (error) {
        console.log("create_token :", error.message);
    }
}

const registeruser = async (req, res) => {
    try {
        console.log(req.body.password)
        const spassword = await securePassword(req.body.password)
        const user = new userModel({
            name: req.body.name,
            email: req.body.email,
            password: spassword,

             mobile:req.body.mobile,
             type:req.body.type,
             image:req.file.filename

        })
        //heck email  exists or not
        const userData = await userModel.findOne({ email: req.body.email });
        if (userData) {
            res.status(200).send({ success: false, msg: "This email already exists..." })


        } else {
            const user_data = await user.save()
            res.status(200).send({ success: true, data: user_data })
        }

    } catch (error) {
        res.status(400).send(error.message)
    }
}

//login user
const loginUser = async (req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        const userData = await userModel.findOne({ email: email });

        if (userData) {
            const matchPassword = await bcryptjs.compare(password, userData.password);
            if (matchPassword) {
                const tokenData = await create_token(userData._id);
                const userResult = {
                    name: userData.name,
                    email: userData.email,
                    password: userData.password,
                    token: tokenData,
                    mobile:userData.mobile,
                    image:userData.image,
                    type:userData.type
                }
                const response = {
                    success: true,
                    msg: "User Details",
                    data: userResult
                }
                res.status(200).send(response);
            } else {
                res.status(200).send({ success: true, msg: "hereLogin details are incorrect" });
            }
        } else {
            res.status(200).send({ success: true, msg: "outLogin details are incorrect" });
        }
    } catch (error) {
        res.status(404).send(error.message);
        console.log("loginUser: ", error.message);
    }
}
//Update password method
const updatePassword = async (req, res) => {
    try {
        const user_id = req.body.user_id;
        const password = req.body.password;
        const userData = await userModel.findById({ _id: user_id });
        if (userData) {
            const newPassword = await securePassword(password);
            const result = await userModel.findByIdAndUpdate({ _id: user_id }, { $set: { password: newPassword } });
            res.status(200).send({ success: true, msg: "Your password has been updated" })
        } else {
            req.status(200).send({ success: false, msg: "User Id not found!" });
        }
    } catch (error) {
        console.log("updatePassword :", error.message);
        res.status(400).send(error.message);
    }
}

// forget password reset it 
const sendResetPasswordMail = async (name, email, token) => {
    try {

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailUser,
                pass: config.passwordUser
            }
        });

        const options = {
            from: config.emailUser,
            to: email,
            subject: 'Verification for reset password',
            html: `<p>Hii ${name}. Please copy the link and<a href="http://localhost:8080/api/reset-password?token=${token}">reset your password</a></p>`
        }

        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.log("Here:",err.message);
            } else {
                console.log("Mail has been sent successfully", info.response);
            }
        })

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });

    }
}

const forgetPassword = async (req, res) => {
    try {

        const userData = await userModel.findOne({ email: req.body.email });
        if (userData) {
            const randomString = randomstring.generate();
            const updatedData = await userModel.updateOne({ email: req.body.email }, { $set: { token: randomString } });
            sendResetPasswordMail(userData.name, userData.email, randomString);
            res.status(200).send({ success: true, msg: "Please check your email for reset password", token: randomString});

        } else {
            res.status(200).send({ success: true, msg: "This email does not exists" });
        }

    } catch (error) {
        res.status(400).send({ success: false, msg: error.message });
    }
}

const resetPassword = async (req, res) => {
    try {

        const token = req.query.token;
        const tokenData = await userModel.findOne({ token: token });
        if (tokenData) {
            const password = req.body.password;
            const spassword = await securePassword(password);
            // const oldData = await userModel.updateOne({ token: token },{$set:{password:spassword,token:''}}); or 
            const updatedData = await userModel.findByIdAndUpdate({ _id: tokenData._id },{$set:{password:spassword,token:''}},{new:true});//new data 
            res.status(200).send({success:true,msg:"Your password has been reset successfully",data:updatedData});
        } else {
            res.status(200).send({ success: true, msg: "This link has been expired" });

        }

    } catch (error) {
        console.log("resetPassword :", error.message);
        res.status(400).send({ success: false, msg: error.message });
    }
}

module.exports = {
    registeruser,
    loginUser,
    updatePassword,
    forgetPassword,
    resetPassword
}
