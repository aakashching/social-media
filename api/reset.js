const express = require("express");
const router = express.Router();
const UserModel = require("../models/UserModel");
const bcrypt = require("bcryptjs");
const nodemailer = require("nodemailer");
const sendGridTransport = require("nodemailer-sendgrid-transport");
const crypto = require("crypto");
const isEmail = require("validator/lib/isEmail");
const baseUrl = require("../utils/baseUrl");
const options = {
  auth: {
    api_key: process.env.SENDGRID_API,
  },
};

const transporter = nodemailer.createTransport(sendGridTransport(options));

// CHECK USER EXIST AND SEND PASSWORD RESET LINK TO USER'S EMAIL

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!isEmail(email)) {
      return res.status(401).send("Invalid Email");
    }
    const user = await UserModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).send("Invalid Email");
    }
    const token = crypto.randomBytes(32).toString("hex");
    user.resetToken = token;
    user.expireToken = Date.now() + 3600000;
    await user.save();

    const href = `${baseUrl}/reset/${token}`;

    const mailOptions = {
      to: user.email,
      from: "aakashching@gmail.com",
      subject: "Hi there! Password reset request",
      html: `<p>Hey ${
        user.name.split(" ")[0]
      }, There was a request for password reset. <a href=${href}>Click Here</a> to reset the password</p>
      <p>This link valid for only 1 hour.</p>`,
    };
    transporter.sendMail(mailOptions, (error,info)=> error && console.log(error))
    res.status(200).send('email sent successfully')
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
});

// VERIFY THE TOKEN AND RESET THE PASSWORD
router.post('/token', async(req,res)=>{
    try {
        const {token, password}= req.body
        if(!token) return res.status(401).send('Unauthorized')
        if(password.lenth<6) return res.status(401).send('Unauthorized')
        const user = await UserModel.findOne({resetToken: token})
        if(!user) return res.status(404).send('User Not Found')
        if(Date.now()> user.expireToken) return res.status(401).send("token expired")
        user.password= await bcrypt.hash(password, 10)
        user.resetToken=''
        user.expireToken=undefined
        await user.save()
        return res.status(200).send('Password Updated')
    } catch (error) {
        console.log(error);
        return res.status(500).send("Server Error");
    }
})

module.exports = router;
