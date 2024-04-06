const jwt=require("jsonwebtoken");
const sql = require("../dataBase/connectdb");
require("dotenv").config();
const {SECRET_KEY}=process.env;

// create jwt token
const create_token = async (id) => {
    try {
  
      const token = await jwt.sign({ userId: id }, SECRET_KEY);
      return token;
  
    } catch (error) {
      console.log("create-token:", error.message);
    }
  }

//is login
const isLogin=async(req,res,next)=>{
  try {
  const token = req.cookies?.jwt;
  if(!token){
    return res.render('login');
  }
  
   const decoded=await jwt.verify(token,SECRET_KEY);
   const userData=await sql`
        SELECT * from users where id=${decoded.userId};`
        
   if(userData){
    req.userId=decoded.userId;
    next();
   }else{
   return res.status(200).send({msg:"Token is invalid or user does not exists. Please remove your cookie and login again"});
   }
  } catch (error) {
      console.log("isLogin:",error.message);
      res.status(400).send(error.message);
  }
}

//is logout
const isLogout=async(req,res,next)=>{
  try {
  const token = req.cookies?.jwt;
  if(!token){
    return next();
  }
  
   const decoded=await jwt.verify(token,SECRET_KEY);
   const userData=await sql`
        SELECT * from users where id=${decoded.userId};`
   console.log(decoded.userId)
   if(userData){
    return res.render('home',{user:userData[0]});
   }else{
   return res.status(200).send({msg:"Token is invalid. Please remove your cookie and login again"});
   }
  } catch (error) {
      console.log("isLogout:",error.message);
      res.status(400).send(error.message);
  }
}


module.exports={
    create_token,
    isLogout,
    isLogin
}
