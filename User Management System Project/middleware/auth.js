
const isLogin=async(req,res,next)=>{
    try {

        if(req.session.user_id){
            console.log("In islogin:",req.session.user_id)
            next();
        }else{
            res.redirect('/login');
        }
        
    } catch (error) {
        // console.log(error.message)
        console.log("Ploblem in isLogin")

    }
}


const isLogout=async(req,res,next)=>{
    try {
        
       if(req.session.user_id){
        res.redirect('/home')
       }else{
       next();
    }

    } catch (error) {
        // console.log(error.message).
        console.log("Ploblem in isLogout")

    }
}

module.exports={
    isLogin,
    isLogout
}