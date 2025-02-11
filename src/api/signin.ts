import express, { NextFunction, Request, Response } from 'express';
import bcrypt from 'bcrypt'
import { Resend } from 'resend';
import db from "../../db"
import { env } from 'process';
import { SigninPayload } from '../types/user';
import jwt from 'jsonwebtoken'
import { error } from 'console';
import rateLimit from 'express-rate-limit';
const otpLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 3, // Limit each IP to 3 OTP requests per windowMs
    message: 'Too many requests, please try again after 5 minutes',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

const passwordResetLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 password reset requests per windowMs
    message: 'Too many password reset attempts, please try again after 15 minutes',
    standardHeaders: true,
    legacyHeaders: false,
});
const genOtp = () => {
    return Math.floor(100000 + Math.random() * 900000)
    
}
const otpStore : Record<string,string> = {}
const router = express.Router();



const verifyInput = (req: Request, res: Response, next: NextFunction) => {
    const payload = SigninPayload.safeParse(req.body)
    if (payload.success) {
        next()
    }
else{
    return res.status(411).json({
        msg : "Invalid Inputs"
}
   )
}
}

router.post("/",verifyInput,async (req, res) => {
    const resend = new Resend(env.RESEND_API_KEY);
    const email = req.body.email
    const userPass = req.body.password
    otpStore[email] = genOtp().toString()
    const user = await db.user.findUnique({
        where : {
            email
        }
    })
 
    if (user?.loggedIn) {
        return res.status(413).json({
            msg : "account is already in use! make sure to logout from all devices before trying again."
        })
    }

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
  html:`<p> OTP  for your email verification is  <strong> ${otpStore[email]} </strong></p><br><p>Team <strong><a href="storelinks.tech">storelinks.tech</a></strong></p>`
        })
        
        console.log('Passwords match! User authenticated.');
        console.log(otpStore[email])
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

router.post("/resendotp", async (req, res) => {
    const email = req.body.email
    try {
otpStore[email] = genOtp().toString()
        const resend = new Resend(env.RESEND_API_KEY);
     resend.emails.send({
  from: 'shivaraj@storelinks.tech',
  to: String(email),
  subject: 'authentication for login',
         html: ` <div> <img src='./logo.png'> <p> OTP for login is <strong> ${otpStore[email]} </strong> </p><br>
         <p>Team <strong><a href="storelinks.tech">storelinks.tech</a></strong></p>
        Team <strong> storelinks.tech </strong>
        `
     })    
     return res.json({
         msg : "sent an otp to email"
     })
    }
    catch (e) {
        return res.status(413).json({
          msg:  "something went wrong!"
        })
    }
})

router.post("/forgotpassword", async (req: Request, res: Response) => {
    const email = req.body.email
    otpStore[email] = genOtp().toString()
    const user = await db.user.findUnique({
        where: {
            email
        }
    })
    if (!user) {
        return res.status(411).json({
            msg : "email is not registered!"
        })
    }
    const resend = new Resend(env.RESEND_API_KEY);
     resend.emails.send({
  from: 'shivaraj@storelinks.tech',
  to: String(email),
  subject: 'password reset',
  html:` <div> <img src='./logo.png'> <p> OTP  for your password recovery is  <strong> ${otpStore[email]} </strong></p></div>`
     })
console.log(otpStore[email])
    return res.json({
        msg : "sent an otp to email"
    })
})

router.post("/resetpassword",passwordResetLimiter, async (req: Request, res: Response) => {    
const otp = req.body.otp
    const email = req.body.email
    const newPassword = req.body.password
    const saltRounds = 10
    try {
        if (!newPassword) {
        return res.status(411).json({
            msg : "password required!"
        })
    }
    if (String(otp) === otpStore[email]) {
        bcrypt.genSalt(saltRounds, (err, salt) => {
            if (err) {
                console.error(err)
                return;
            }

            bcrypt.hash(newPassword, salt, async (err, hash) => {
                if (err) {
                    console.error(err)
                    return;
                }
                const user = await db.user.update({
                    where: {
                        email
                    },
                    data: {
                        password: hash
                    }
                })
                bcrypt.compare(newPassword, user.password, (err, result) => {
                    if (err) {
                        // Handle error
                        console.error('Error comparing passwords:', err);
                        return res.status(413).json({
                            msg: "something went wrong"
                        })
                    }
                    if (result) {
                        console.log("changed the password!")
                        return res.json({
                            msg: "password reset successfull, login!"
                        })
                    }
                });
            });
        })
    }
    else {
    return res.status(413).json({
        msg: "otp verification falied",
     }) 
    } 
    }
    catch (E) {
      console.log(E)
    }
})

router.post("/verify",otpLimiter, async (req, res) => {
    const email = req.body.email
    const password = req.body.password
    const otp = req.body.otp
    const token = jwt.sign({email,password},env.secret ?? "")
if(String(otp) === otpStore[email]){
    await db.user.update({
        where: {
            email
        },
        data: {
            loggedIn : true
        }
    })
    return res.json({
        msg: "signed in",
        token : token
    })
}
else{
    return res.status(413).json({
        msg:"verification failed!"
    })
}
})


export default router
