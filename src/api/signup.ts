import express from 'express';
import bcrypt from 'bcrypt'
import { Resend } from 'resend';
import db from "../../db"
import { env } from 'process';
import { error } from 'console';
const router = express.Router();

const genOtp = () => {
    return Math.floor(100000 + Math.random() * 900000)
    
}

let currOtp: number


router.post("/",async(req,res)=>{
    const resend = new Resend(env.RESEND_API_KEY);
    const email = req.body.email
    try {
        const user = await db.user.findFirst({
        where: {
            email
        }
    })
    if (user) {
        return res.json({
            msg : "email already exists!"
        })
    }
currOtp =  genOtp()
resend.emails.send({
  from: 'shivaraj@storelinks.tech',
  to: String(email),
  subject: 'email verification',
  html:` <p> OTP  for your email verification is  <strong> ${currOtp} </strong></p>`
})
return res.json({
msg : "sent an otp to your email for verification"
})
    }
    catch (e) {
        console.error(e)
    }
})

router.post("/verify",async(req,res)=>{
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


export default router;
