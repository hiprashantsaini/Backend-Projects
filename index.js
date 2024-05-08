const express=require('express');
const mongoose=require('mongoose');
const router = require('./routes/userRoutes');
mongoose.connect('mongodb://127.0.0.1:27017/Task1');
const app=express();
const postRoute=require('./routes/postRoute');

app.use('/api',router);

app.use('/post',postRoute);

app.listen(8080,(err)=>{
    if(err) throw console.error(err);
    console.log("Server Started");
})