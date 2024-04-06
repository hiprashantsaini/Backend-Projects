const express=require("express");
const app=express();
const userRoute = require("./routes/user-routes");
const courseRoute = require("./routes/course-route");
const adminRoute = require("./routes/admin-route");
// app.use(express.static('public'));

app.use('/',userRoute);
app.use('/user',userRoute);
app.use('/course',courseRoute);
app.use('/admin',adminRoute);

app.listen(8080,(err)=>{
    if(!err){
        console.log("Server Started");
    }
})