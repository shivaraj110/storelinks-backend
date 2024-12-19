import express from 'express';
import bcrypt from 'bcrypt'
import { Resend } from 'resend';
import db from "../../db"
import { env } from 'process';

const genOtp = () => {
    return Math.floor(100000 + Math.random() * 900000)
    
}
let currOtp: number
const router = express.Router();


router.post("/", async (req, res) => {
    const resend = new Resend(env.RESEND_API_KEY);
    
    const email = req.body.email
    const userPass = req.body.password
    currOtp = genOtp()
    const user = await db.user.findFirst({
        where : {
            email
        }
    })

if(!user?.id){
    return res.json({
        msg: "user not found try signing up!"
    })
}
    bcrypt.compare(userPass, user.password, (err, result) => {
        if (err) {
            // Handle error
            console.error('Error comparing passwords:', err);
            return res.status(413).json({
                msg : "something went wrong"
            })
        }
    
    if (result) {
        // Passwords match, authentication successful
        resend.emails.send({
  from: 'shivaraj@storelinks.tech',
  to: String(email),
  subject: 'email verification',
  html:` <p> OTP  for your email verification is  <strong> ${currOtp} </strong></p>`
        })
        
        console.log('Passwords match! User authenticated.');
        return res.json({
     msg : "sent an otp to your email for verification"
 })
    } else {
        // Passwords don't match, authentication failed
        console.log('Passwords do not match! Authentication failed.');
               return res.status(400).json({
     msg : "wrong password!"
 })
    }
    });
})

router.post("/verify",async(req,res)=>{
const password = req.body.password
const otp = req.body.otp
const saltRounds = 10
const email = req.body.email
if(Number(otp) === currOtp){
    currOtp = 0
    return res.json({
        msg : "signed in"
    })
}
else{
    currOtp = 0
    return res.json({
        msg:"verification failed!"
    })
}
})

export default router