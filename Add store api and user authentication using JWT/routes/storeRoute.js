const express=require("express");
const store_route=express();
const path=require("path");
store_route.use(express.urlencoded({extended:true}));

module.exports=store_route;
const multer=require("multer");
const storeController = require("../controllers/storeController");
store_route.use(express.static('public')); 

const storage= multer.diskStorage({
    destination:function(req,file,cb){
        cb(null,path.join(__dirname,'../public/storeImages'));
    },
    filename:function(req,file,cb){
        cb(null,Date.now()+'-'+file.originalname);
    }
});
const upload=multer({storage:storage});

store_route.post('/create-store',upload.single('logo'),storeController.createStore);

module.exports=store_route;