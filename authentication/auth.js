const jwt=require('jsonwebtoken');
const config=require('../config');
const isLogin=(req,res,next)=>{
   try {
     const token=req.body.token || req.query.token || req.headers.authorization
     console.log(token)
     if(!token){
        return res.send("Authentication failed!: Invalid token or token required");
     }
     jwt.verify(token,config.SECRET_KEY,(err,resolve)=>{
        if(err){
           return res.send({msg:'authentication failed'});
        }
        console.log("isLogin",resolve)
        req.userId=resolve.id;
        next();
     });
   } catch (error) {
    console.log("isLogin :",error.message);
    return res.send("Authentication failed!");
   }
}

module.exports=isLogin;