import express from 'express';
import bcrypt from 'bcrypt'
import { Resend } from 'resend';
import db from "../../db"
import { env } from 'process';
import { Request , Response,NextFunction} from 'express';
import { SignupPayload } from '../types/user';
import jwt from 'jsonwebtoken'
const router = express.Router();

const genOtp = () => {
    return Math.floor(100000 + Math.random() * 900000)
    
}

let currOtp: number

const verifyInput = (req: Request, res: Response, next: NextFunction) => {
    const payload = SignupPayload.safeParse(req.body)
    if (payload.success) {
        next()
    }else{
return res.status(411).json({
        msg : "Invalid Inputs"
    })
}
    }


router.post("/",verifyInput,async(req,res)=>{
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
            msg : "an user already exists with this email!"
        })
    }
currOtp =  genOtp()
resend.emails.send({
  from: 'shivaraj@storelinks.tech',
  to: String(email),
  subject: 'email verification',
 html:`<p> OTP  for your email verification is  <strong> ${currOtp} </strong></p><br><p>Team <strong><a href="storelinks.tech">storelinks.tech</a></strong></p>`
})
return res.json({
msg : "sent an otp to your email for verification"
})
    }
    catch (e) {
        console.error(e)
    }
})

router.post("/resendotp", async (req, res) => {
    const email = req.body.email
    currOtp = genOtp()
        const resend = new Resend(env.RESEND_API_KEY);
     resend.emails.send({
  from: 'shivaraj@storelinks.tech',
  to: String(email),
  subject: 'authentication for login',
         html: ` <div> <img src='./logo.png'> <p> OTP for login is <strong> ${currOtp} </strong> </p><br>
         <p>Team <strong><a href="storelinks.tech">storelinks.tech</a></strong></p>
        Team <strong> storelinks.tech </strong>
        `
     })
    return res.json({
        msg : "sent an otp to email"
    })
})


router.post("/verify",async(req,res)=>{
    const fname = req.body.fname
    const lname = req.body.fname
    const password = req.body.password
    const saltRounds = 10
const email = req.body.email
const otp = req.body.otp
    try {
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
               const user =  await db.user.create({
                    data : {
                        fname,
                        lname,
                        email,
                       password: hash,
                        
                    }
                })

        });
    }); 
    const token = jwt.sign({email,password},env.secret ?? "")
    return res.json({
        msg: "verified",
        token: token
    })
    }
    else{
        currOtp = 0
        return res.json({
            msg:"verification failed!"
        })
    }
    }
         catch (e) {
        return res.status(413).json({
                msg : "invalid input"
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
