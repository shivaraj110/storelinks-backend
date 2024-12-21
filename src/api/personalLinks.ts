import express, { NextFunction, Request, Response } from 'express';
import db from "../../db"
import { linkPayload } from '../types/links';
import { error } from 'console'; 
import jwt from 'jsonwebtoken'
import { secret } from '../config/jwtSecret';
const router = express.Router();

const verifyUser = async (req: Request, res: Response, next: NextFunction) => {
    if (!req.headers.authorization) {
        return res.status(411).json({
            msg : "no token found!"
        })
    }
    const token = req.headers.authorization.split(" ")[1]

    const user: any = jwt.verify(token, secret)
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

const verifyInput = (req: Request, res: Response, next: NextFunction) => {
    const linkInput = linkPayload.safeParse(req.body)
    if (!linkInput.success) {
        return res.status(411).json({
            msg : "invalid inputs!"
        })
    }
    next()
}

router.post("/link",verifyUser,verifyInput, async (req: Request, res: Response) => {
    const link = req.body.link
    const title = req.body.title
    const description = req.body.description
    const userId = req.body.userId
    try {
       const Link =  await db.link.create({
            data: {
                title,
                desc: description,
                link,
                userId
            }
       })
        if (Link) {
            return res.json({
                msg : "link added successfully!"
            })
        }
        else {
            return res.status(411).json({
                msg : "error adding the link!"
            })
        }
    }
    catch (e) {
        error(e)
        return res.status(400).json({
            msg:"somthing went wrong!"
        })
    }
})

router.get("/links",verifyUser,async (req,res)=>{
    const userId = req.body.userId
    const links = await db.link.findMany({
        where: {
            userId
        }
    })
    return res.json({
        links
    })
})

router.delete("/link", verifyUser, async (req, res) => {
    const userId = req.body.userId
    const id = req.body.id
    const link = await db.link.delete({
        where: {
            id
        }
    })
    if (link) {
        return res.json({
            msg : `deleted ${link.title}!`
        })
    }
    else {
        return res.status(411).json({
            msg : "error deleting the link!"
        })
    }
})


router.put("/link", verifyInput, verifyUser, async (req, res) => {
    const id = req.body.id
    const link = req.body.link
    const title = req.body.title
    const description = req.body.description
    const userId = req.body.userId
    try {
        const Link = await db.link.update({
            where: {
                userId,
                id
            }, data: {
                title,
                desc: description,
                link
            }
        })
        if (Link) {
           return res.json({
                msg : `updated ${Link.title}`
            })
        }
        else {
           return res.json({
                msg : "error updating the link!"
            })
        }
    }
    catch (e) {
        error(e)
        
    }
})

export default router