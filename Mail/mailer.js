
import nodemailer from 'nodemailer'
import dotenv from 'dotenv'
dotenv.config();
const otp_send=(email='',otp='')=>{


    const email_template=`<!DOCTYPE html>
    <html lang="en" >
    <head>
      <meta charset="UTF-8" />
      <meta http-equiv="X-UA-Compatible" content="IE=edge" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>CHATAPP -OTP-</title>
      
    
    </head>
    <body>
    <!-- partial:index.partial.html -->
    <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      <div style="margin:50px auto;width:70%;padding:20px 0">
        <div style="border-bottom:1px solid #eee">
          <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">CHATAPP</a>
        </div>
        <p style="font-size:1.1em">Hi, ${email}</p>
        <p>Thank you for choosing Chatapp. Use the following OTP to complete your Sign Up procedures.</p>
        <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
        <p style="font-size:0.9em;">Regards,<br />CHATAPP</p>
        <hr style="border:none;border-top:1px solid #eee" />
        <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
          <p>CHATAPP Inc</p>
          <p>Sircilla</p>
          <p>@pranay</p>
        </div>
      </div>
    </div>
    <!-- partial -->
      
    </body>
    </html>
    `





    // async..await is not allowed in global scope, must use a wrapper
async function main() {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.user, // generated ethereal user
        pass: process.env.pass, // generated ethereal password
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: '"Your OTP for CHATAPP Registration <'+email+'>', // sender address
      to: email, // list of receivers
      subject: "OTP For CHATAPP Registration ✔", // Subject line
      text: "Hello "+email, // plain text body
      html: email_template, // html body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
  }
  
  main().catch(console.error);

}

export default otp_send;