const express=require('express')
const app=express();

const mongoose=require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/user_management_system')

//For user route
const user_route = require('./routes/userRoute');
app.use('/',user_route)

//For admin route
const admin_route = require('./routes/adminRoute');
app.use('/admin',admin_route)

app.listen(8080,()=>{
    console.log("server is running..")
})