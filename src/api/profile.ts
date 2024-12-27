import express, { NextFunction, Request, Response } from 'express';
import db from "../../db"
import { error } from 'console';
import jwt from 'jsonwebtoken'
import { env } from 'process';
const router = express.Router()
const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return res.status(411).json({
            msg : "no token found!"
        })
    }
    const token = req.headers.authorization.split(" ")[1]

    const user: any = jwt.verify(token, env.secret ?? "")
    try {
         const loggedUser = await db.user.findFirst({
        where: {
            email : user.email
        }
    })
    if (!loggedUser || !loggedUser.loggedIn) {
        return res.status(411).json({
            msg : "you are not authenticated to perform this action"
        })
    }
    req.body.userId = loggedUser.id
    next()
    }
    catch (E) {
        error(E)
   }
}


router.put("/edit",verifyUser,async(req,res)=>{
	const email = req.body.email
	const fname = req.body.fname 
	const lname = req.body.lname
	const userId = req.body.userId
	
	const response = await db.user.update({
where : {
	id : userId
},
data:{
email,fname,lname
}
})
if(response.id){
return res.status(200).json({
msg : "updated user profile successfully!"
})
}
else{
return res.status(411).json({
msg : "couldn't update the profile!"
})
}
})
export default router
