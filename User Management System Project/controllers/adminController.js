const userModel = require('../models/userModel'); //Because schema for admin and user is same
const bcrypt = require('bcryptjs');
const randomstring=require('randomstring')
const config=require('../config/config');
const nodemailer=require('nodemailer')
const exceljs=require('exceljs')

// html to pdf generate required things 
const ejs=require('ejs');
const pdf=require('html-pdf');
const fs=require('fs');
const path=require('path');


const securePassword = async (password) => {
    try {

         const passwordHash = await bcrypt.hash(password, 10)//10 is salt value that is used to add additional randomness to the hashed output
         return passwordHash;

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
              html: `<p>Hii ${name}, please click here to <a href="http://127.0.0.1:8080/admin/forget-password?token=${token}">Reset</a> your password</p>`
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

// for send mail 
const addUserMail = async (name, email, password, user_id) => {
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
              subject: 'Admin added you and verify your email',
              html: `<p>Hii ${name}, please click here to <a href="http://127.0.0.1:8080/verify?id=${user_id}">Verify</a> your mail</p> <br/> <b>Email:</b>${email}<br/> <b>Password: </b>${password}`
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

const loadLogin = async (req, res) => {
    try {

        res.render('login');

    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {
    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await userModel.findOne({ email: email })

        if (userData) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (passwordMatch) {

                if (userData.is_admin === 0) {
                    res.render('login', { massage: "Email and password is incorrect" });
                } else {

                    req.session.user_id = userData._id;
                    res.redirect('/admin/home');

                }

            } else {
                res.render('login', { massage: "Email and password is incorrect" });
            }


        } else {
            res.render('login', { massage: "Email and password is incorrect" });
        }


    } catch (error) {
        console.log(error.message);
    }
}

const loadDashboard = async (req, res) => {
    try {
        const userData=await userModel.findById({_id:req.session.user_id});
        res.render('home',{admin:userData})
    } catch (error) {
        console.log(error.message);
    }
}

const logout = async (req, res) => {
    try {
        req.session.destroy();
        res.redirect('/admin')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetLoad=async(req,res)=>{
    try {
        res.render('forget')
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify=async(req,res)=>{
    try {

          const email=req.body.email;
          const userData=await userModel.findOne({email:email});
          if(userData){

            if(userData.is_admin===0){
            res.render('forget',{message:"Email is incorrect"});
            }else{
               
                const randomString=randomstring.generate();
                const updatedData=await userModel.updateOne({email:email},{$set:{token:randomString}});
                sendResetPasswordMail(userData.name,userData.email,randomString);
                res.render('forget',{message:"Check your email to reset your password"});
            }

          }else{
            res.render('forget',{message:"Email is incorrect"});
          }

    } catch (error) {
        console.log(error.message);
    }
}

const forgetPasswordLoad=async(req,res)=>{
    try {
        
        const token=req.query.token;
        const tokenData=await userModel.findOne({token:token});
        if(tokenData){
           
            res.render('forget-password',{user_id:tokenData._id});

        }else{
            res.render('404',{message:"Invalid link"})
        }

    } catch (error) {
        console.log(error.message)
    }
}

const resetPassword=async(req,res)=>{
    try {
        const password=req.body.password;
        const user_id=req.body.user_id;
        const securePass=await securePassword(password);//Don't put same name
        const updatedData=await userModel.findByIdAndUpdate({_id:user_id},{$set:{password:securePass, token:''}});
        res.redirect('/admin');

    } catch (error) {
        console.log(error.message);
    }
}

const adminDashboard=async(req,res)=>{
    try {
        var search="";
        if(req.query.search){
            search=req.query.search;
        }

        var page=1;
        if(req.query.page){
            page=req.query.page;
        }
        const limit=2;

        const usersData=await userModel.find({
            is_admin:0,
            $or:[
                {name:{$regex:'.*'+search+'.*',$options:'i'}},//'i' means ignore lower or upper case difference
                {email:{$regex:'.*'+search+'.*',$options:'i'}},
                {mobile:{$regex:'.*'+search+'.*',$options:'i'}}
            ]
        }).limit(limit * 1)
         .skip((page-1)*limit)
         .exec();

         const count=await userModel.find({
            is_admin:0,
            $or:[
                {name:{$regex:'.*'+search+'.*',$options:'i'}},//'i' means ignore lower or upper case difference
                {email:{$regex:'.*'+search+'.*',$options:'i'}},
                {mobile:{$regex:'.*'+search+'.*',$options:'i'}}
            ]
        }).countDocuments();

        res.render('dashboard',{
            users:usersData,
            totalPages: Math.ceil(count/limit),
            currentPage:page
        });

    } catch (error) {
        console.log(error.message);
    }
}

//Add new user
const newUserLoad=async(req,res)=>{
    try {
        res.render('new-user');
    } catch (error) {
        console.log(error.message);
    }
}

const addUser=async(req,res)=>{
    try {
        
        const name=req.body.name;
        const email=req.body.email;
        const mobile=req.body.mobile;
        const image=req.file.filename;
        const password=randomstring.generate(8)// password of 8 characters
        const spassword=await securePassword(password);

        const user=new userModel({
             name:name,
             email:email,
             mobile:mobile,
             image:image,
             password:spassword,
             is_admin:0
        })
        const userData=await user.save();
        if(userData){
             addUserMail(name,email,password,userData._id);
             res.redirect('/admin/dashboard')
        }else{
             res.render('new-user',{message:"Something went wrong"})
        }

    } catch (error) {
        console.log(error.message);
    }
}

// edit user functionality 
const editUserLoad=async(req,res)=>{
    try {
        const id=req.query.id;
        const userData=await userModel.findById({_id:id});
        if(userData){
            res.render('edit-user',{user:userData});
        }else{
            res.redirect('/admin/dashboard')
        }
    } catch (error) {
        console.log(error.message);
    }
}

const updateUsers=async(req,res)=>{
    try {
        const userData=await userModel.findByIdAndUpdate({_id:req.body.id},{$set:{name:req.body.name, email:req.body.email, mobile:req.body.mobile, is_varified:req.body.verify}});
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.log(error.message);
    }
}

// Delete users 
const deleteUser=async(req,res)=>{
    try {
        
        const id=req.query.id;
        await userModel.deleteOne({_id:id});
        res.redirect('/admin/dashboard');

    } catch (error) {
        console.log(error.message);
    }
}

//Export users data
const exportUsers=async(req,res)=>{
    try {
        
        const workbook=new exceljs.Workbook();
        const worksheet= workbook.addWorksheet("My users");
        worksheet.columns=[
            {header:"S.no.", key:"s_no"},
            {header:"Name", key:"name"},
            {header:"Email id", key:"email"},
            {header:"Mobile", key:"mobile"},
            {header:"Image", key:"image"},
            {header:"Is Admin", key:"is_admin"},
            {header:"Is Verified", key:"is_varified"}
        ];
        let counter=1;
        const userData=await userModel.find({is_admin:0});
        userData.forEach((user)=>{
            user.s_no=counter;
            worksheet.addRow(user);
            counter++;
       });

       worksheet.getRow(1).eachCell((cell)=>{
        cell.font= {bold:true};
       })

       res.setHeader(
             "Content-Type",
             "application/vnd.openxmlformats-officedocument.spreadsheatml.sheet"
       );

       res.setHeader("Content-Disposition",`attachment; filename=users.xlsx`);

       return workbook.xlsx.write(res).then(()=>{
        res.status(200);
       });

    } catch (error) {
        console.log(error.message);
    }
}

// Export users data in pdf 
const exportUsersPdf=async(req,res)=>{
    try {
        
        const users=await userModel.find({is_admin:0});
        const data={
            users:users
        }
        const filePathName=path.resolve(__dirname,'../views/admin/htmltopdf.ejs');
        const htmlString=fs.readFileSync(filePathName).toString();
        let options ={
            // format:'letter' //or
               format:"A3",
               orientation:"portrait",
               border:"15mm"
        }
        const ejsData= ejs.render(htmlString,data);
        pdf.create(ejsData,options).toFile('users.pdf',(err,response)=>{
            if(err) console.log(err);
            // to download file pdf
            const filepath= path.resolve(__dirname,'../users.pdf');//or use path.join
            fs.readFile(filepath,(err,file)=>{
                if(err){
                    console.log(err);
                    res.status(500).send("Could no download file")
                }

                res.setHeader('Content-Type','application/pdf');
                res.setHeader('Content-Disposition','attachment; filename="users.pdf');

                res.send(file);
            });
        })


    } catch (error) {
        console.log(error.message)
    }
}

module.exports = {
    loadLogin,
    verifyLogin,
    loadDashboard,
    logout,
    forgetLoad,
    forgetVerify,
    forgetPasswordLoad,
    resetPassword,
    adminDashboard,
    newUserLoad,
    addUser,
    editUserLoad,
    updateUsers,
    deleteUser,
    exportUsers,
    exportUsersPdf
}