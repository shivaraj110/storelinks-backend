import express, { NextFunction, Request, Response } from 'express';
import db from "../../db"
import { error } from 'console'; 
import jwt from 'jsonwebtoken'
import { scholarships } from '../types/categories';
import { env } from 'process';
const router = express.Router();

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

const verifyInput = (req: Request, res: Response, next: NextFunction) => {
    const linkInput = scholarships.safeParse(req.body)
    if (!linkInput.success) {
        return res.status(411).json({
            msg : "invalid inputs!"
        })
    }
    next()
}
router.post("/link", verifyUser, verifyInput, async (req, res) => {
    const userId = req.body.userId
    const title = req.body.title
    const description = req.body.description
    const org = req.body.org
    const link = req.body.link
    try {
        const Link = await db.scholarships.create({
            data: {
                title, desc: description, org, link,
                userId
            }
        })
        if (!Link) {
            return res.status(411).json({
                msg : "failed to push the link!"
            })
        }
        return res.json({
            msg : "added the link successfuly!"
        })
    }
    catch (e) {
        error(e)
        return res.json({
            msg : "something went wrong!"
        })
    }
})


router.get("/links", verifyUser, async (req, res) => {
    try {
        const links = await db.scholarships.findMany({
            select: {
                id: true,
                user: {
                    select: {
                        fname: true,
                        id:true
                    }
                },
                title: true,
                desc: true,
                link: true,
                org: true,
                views: true,
                postedOn: true,
            }
        })
        return res.json({
            links
        })
    }
    catch (e) {
        error(e)
        return res.status(411).json({
            msg :"something went wrong!"
        })
    }
})

router.delete("/link", verifyUser, async (req, res) => {
    const userId = req.body.userId
    const id = req.body.id
    try {
        const link = await db.scholarships.delete({
            where: {
                id,userId
            }
        })
        if (link) {
            return res.json({
                msg : `deleted ${link.title}!`
            })
        }
        else {
            return res.status(411).json({
                msg : "you don't have permissions to delete links that are not posted by you!"
            })
        }
    }
    catch (e) {
        error(e)
        return res.status(411).json({
            msg :"access denied!"
        })
    }
})


router.put("/link", verifyInput, verifyUser, async (req, res) => {
    const id = req.body.id
    const userId = req.body.userId
    const title = req.body.title
    const description = req.body.description
    const org = req.body.body
    const link = req.body.link
    try {
        const Link = await db.scholarships.update({
            where: {
                userId,
                id
            }, data: {
                title, desc: description, org, link,
                userId
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
        return res.status(411).json({
            msg :"something went wrong!"
        })
    }
})

router.put("/view", verifyUser, async (req, res) => {
    const id = req.body.id
    try {
    const Link = await db.scholarships.update({
        where: {
            id
        },
        data: {
            views: {
                increment: 1,
            }
        }
    })
    if (!Link) {
        return res.status(411).json({
            msg : "error updating the views!"
        })
    }
    return res.json({
        msg : "updated the views!"
    })
    }
    catch(e){
        error(e)
        return res.status(413).json({
            msg : "something went wrong!"
        })
    }
})

export default router