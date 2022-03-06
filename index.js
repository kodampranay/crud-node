import express from "express";
import routes from "./Routes/userRoutes.js";
import dotenv from 'dotenv';
import mongoose from "mongoose";
import cookieParser from "cookie-parser";
import fileUpload from "express-fileupload";





// initilization of app
const app=express();
app.use(fileUpload());
// initilization of app


app.use(function (req, res, next) {

    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});

dotenv.config();
app.use(express.static("public"));
app.use("/uploads", express.static("uploads/webp"));

app.use(express.json())
app.use(cookieParser());
app.use('/',routes);


const DB=process.env.DB;
const PORT =process.env.PORT || 5000;

mongoose.connect(DB).then(()=>console.log('db is connected')).catch((err)=>console.log(err))
app.listen(PORT,()=>
{
    console.log('Server is Running At http://localhost:'+PORT);
})