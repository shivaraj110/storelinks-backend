import express from 'express';
import bcrypt from 'bcrypt'
import { Resend } from 'resend';
import db from "../../db"
import { env } from 'process';
const router = express.Router();

const genOtp = () => {
return Math.floor(100000 + Math.random()* 900000)
}

let currOtp:number

router.post("/signup",async(req,res)=>{
    const resend = new Resend(env.RESEND_API_KEY);
    const email = req.body.email
currOtp =  genOtp()
resend.emails.send({
  from: 'shivaraj@storelinks.tech',
  to: String(email),
  subject: 'email verification',
  html:` <p> OTP  for your email verification is  <strong> ${currOtp} </strong></p>`
})
return res.json({
msg : "sent an otp to your email"
})
})

router.post("/signup/verify",async(req,res)=>{
    const fname = req.body.fname
    const lname = req.body.fname
    const password = req.body.password
    const saltRounds = 10
const email = req.body.email
const otp = req.body.otp
if(Number(otp) === currOtp){
    currOtp = 0
    bcrypt.genSalt(saltRounds, (err, salt) => {
        if (err) {
            console.error(err)
            return;
        }

        bcrypt.hash(password, salt,async (err, hash) => {
            if (err) {
                console.error(err)
                return;
            }
                console.log('Hashed password:', hash);
                await db.user.create({
                    data : {
                        fname,
                        lname,
                        email,
                        password : hash
                    }
                })

        });
        }); 
    return res.json({
        msg : "verified"
    })
}
else{
    currOtp = 0
    return res.json({
        msg:"verification failed!"
    })
}
})

router.get("/",async(req,res)=>{
    const user = await db.user.findFirst({
        where : {
            fname : req.body.fname
        },
        select : {
            password : true
        }
    })
    
    return res.json({
        user
    })
})  

router.get("/signin",async (req,res)=>{
    const email = req.body.email
    const userPass = req.body.password
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
            return res.json({
                msg : "signin failed"
            })
        }
    
    if (result) {
        // Passwords match, authentication successful
        
        console.log('Passwords match! User authenticated.');
        return res.json({
            msg : "signed in!"
        })
    } else {
        // Passwords don't match, authentication failed
        console.log('Passwords do not match! Authentication failed.');
        return res.json({
            msg : "auth failed!" 
        })
    }
    });
})
export default router;
