const express=require('express')
const app=express();


const mongoose=require('mongoose')
mongoose.connect('mongodb://127.0.0.1:27017/ECOM')

app.set('view engine','ejs');
app.set('views','./');

app.get('/',(req,res)=>{
    res.render('login')
})

app.get('/register',(req,res)=>{
    res.render('register')
})
// User Rouet
const user_routes=require('./routes/userRoute')
app.use('/api',user_routes);

// Store Route
const store_route=require('./routes/storeRoute');
app.use('/api',store_route);

app.listen(8080,(err)=>{
    console.log("server is running...")
})

