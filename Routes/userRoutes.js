import e, { Router } from "express";
import Usermodel from "../Model/userModel.js";
import validator from "validator";
import PasswordValidator from "password-validator";
import bcrypt from "bcrypt";
import otp_send from "../Mail/mailer.js";
import jwt from "jsonwebtoken";
import path from 'path'
import {fileURLToPath} from 'url';
import fs from "fs";
import os from "os";
import imagemin from "imagemin";
import imageminWebp from "imagemin-webp";





const routes = Router();

routes.get("/", (req, res) => {
  res.send({ message: "you are home page" });
});

// register router
routes.post("/register", (req, res) => {
  const { password } = req.body;
  var email = req.body.email;
  // console.log((req.body.email))
  // email=email.toLowerCase();
  if (!email) return res.send({ status: 1, message: "enter your email" });
  if (email) {
    email = email.toLowerCase();
  }
  if (!password)
    return res.send({ status: 0, message: "enter your passwordl" });
  if (!validator.isEmail(email))
    return res.send({ status: 0, message: "please enter valid mail" });
  var schema = new PasswordValidator();

  // Add properties to it
  schema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase(1) // Must have uppercase letters
    .has()
    .lowercase(1) // Must have lowercase letters
    .has()
    .digits(1) // Must have at least 2 digits
    .has()
    .not()
    .spaces();
  if (!schema.validate(password))
    return res.send({
      status: 0,
      message: "Password not matched minumum creteria",
    });

  async function data() {
    const data = await Usermodel.find({ email }).countDocuments();
    if (data) {
      async function status() {
        const status = await Usermodel.find({
          email,
          status: { $eq: true },
        }).countDocuments();
        // console.log('status',status)
        if (status)
          return res.send({ status: 2, message: "email already existed" });
        else {
          return res.send({
            status: 3,
            message: "email already existed",
            email,
          });
        }
      }
      status();
    } else {
      const otp = Math.floor(100000 + Math.random() * 900000);
      bcrypt.hash(password, 10, function (err, hash) {
        const newUser = Usermodel({
          email,
          password: hash,
          otp,
        });
        newUser
          .save()
          .then((result) => {
            return res.send({ status: 1, message: "email registered", email });
          })
          .catch((err) => {
            return res.send({ status: 0, err });
          });
        otp_send(email, otp);
      });
    }
    // return res.send({status:2,message:"email already existed"})
  }
  data();
});

// otp verification
routes.post("/register/otp", (req, res) => {
  const { otp } = req.body;
  var email = req.body.email;
  if (!email) {
    return res.send({ status: 0, message: "no email" });
  }
  if (email) {
    email = email.toLowerCase();
  }
  if (!otp) {
    return res.send({ status: 0, message: "Enter otp" });
  }
  if (!validator.isEmail(email)) {
    return res.send({ status: 0, message: "email not valid" });
  }

  // checking data
  async function data() {
    const numbers = await Usermodel.find({ email }).countDocuments();
    const data = await Usermodel.find({ email });

    if (numbers) {
      if (data[0].otp == otp) {
        Usermodel.updateOne({ email }, { $set: { status: true } }).then(
          (response) => {
            if (response.modifiedCount == 1)
              return res.send({ status: 1, message: "registation verified" });
            else {
              return res.send({
                status: 1,
                message: "You are already verified",
              });
            }
          }
        );
      } else {
        return res.send({ status: -1, message: "otp wrong" });
      }
    } else {
      return res.send({ status: -2, message: "email wrong" });
    }
  }
  data();
});

// login authentication

routes.post("/login", (req, res) => {
  const { password } = req.body;
  var email = req.body.email;
  // console.log((req.body.email))
  if (!email) return res.send({ status: 0, message: "enter your email" });
  if (email) {
    email = email.toLowerCase();
  }
  if (!password)
    return res.send({ status: 0, message: "enter your passwordl" });
  if (!validator.isEmail(email))
    return res.send({ status: 0, message: "please enter valid mail" });
  var schema = new PasswordValidator();

  // Add properties to it
  schema
    .is()
    .min(8) // Minimum length 8
    .is()
    .max(100) // Maximum length 100
    .has()
    .uppercase(1) // Must have uppercase letters
    .has()
    .lowercase(1) // Must have lowercase letters
    .has()
    .digits(1) // Must have at least 2 digits
    .has()
    .not()
    .spaces();
  if (!schema.validate(password))
    return res.send({
      status: 0,
      message: "Password not matched minumum creteria",
    });

  // checking data
  async function data() {
    const numbers = await Usermodel.find({ email }).countDocuments();
    const data = await Usermodel.find({ email: email });
    const data2 = await Usermodel.find({ email }).select({ _id: 1 });
    // console.log(data2[0].id);
    if (numbers) {
      bcrypt.compare(password, data[0].password).then(function (result) {
        // result == true
        // console.log(data)
        if (result) {
          // console.log(req.cookies)
          // creating jwt token
          if(req.cookies.token)
          {
            jwt.verify(req.cookies.token, process.env.key, function(err, decoded) {
              if(decoded)
              {
                
                return res.send({ status: 1, message: "youare already logged in" });
              }
              else{
                res.clearCookie('token');
                return res.send({ status: -1, message: "unAuthorized member" });
              }
              
            });
            
          }
          else{
          var token = jwt.sign({ token: data2[0].id }, process.env.key);
          
          // console.log({ token: token });
          // console.log({token:req})
          res.cookie('token' , token);
          // setTimeout(() => {
          //   console.log( req.cookies.token)
          // }, 1000);
          
          return res.send({ status: 2, message: "login success" });
          }
        } else {
          return res.send({ status: 0, message: "Wrong Password" });
        }
      });
    } else {
      return res.send({ status: 0, message: "email wrong" });
    }
  }
  data();
});



// file upload


routes.post("/upload", (req, res) => {
  const file_type = "image";
  const uid = new Date().toDateString() + new Date().getTime();
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send({ error: "no files uploading  " });
  }
  if (!req.files.sampleFile) return res.send({ error: "no file found" });
  const { sampleFile } = req.files;
  if (sampleFile.length != undefined)
    return res.send({ error: "multiple files sending" });
  var file_types = sampleFile.mimetype.split("/");
  if (!file_types.includes(file_type))
    return res.send({ error: "not an image" });
  //   console.log((sampleFile.name).replaceAll(/\s/g,''))

  var upload_path =
    "/uploads/" +
    "profile_" +
    uid.replaceAll(/\s/g, "");
  // console.log(path.dirname);
  sampleFile.mv("." + upload_path+
  path.extname(sampleFile.name), function (err) {
    if (!err) {    
        
        // converting into webp


        imagemin(["./"+upload_path+
        path.extname(sampleFile.name)], {
            destination: "./uploads/webp/",
            plugins: [
              imageminWebp({
                  quality: 80
                //   ,
                //   resize: {
                //     width: 1000,
                //     height: 0
                //   }
              }),
            ],
          }).then(() => {
            console.log("Images Converted Successfully!!!");
          }).catch((err)=>console.log(err));


      return res.send({
        message: "file send ok",
        path: req.protocol + "://" + req.get("host") + upload_path+".webp",
      });
    } else {
      //   converting image into webp

     
      
      return res.send({ message: err });
    }
  });
});

export default routes;
