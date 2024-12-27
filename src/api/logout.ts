import express from 'express';
import db from "../../db"

import jwt from 'jsonwebtoken'
import { error } from 'console';
import { env } from 'process';
const router = express.Router();

router.put("/", async (req, res) => {
    if (!req.headers.authorization) {
        return res.status(411).json({
            msg: "no token found!"
        })
    }
    const token = req.headers.authorization.split(" ")[1]

    const user: any = jwt.verify(token, env.secret ?? "")
    try {
        const loggedUser = await db.user.update({
            where: {
                email: user.email
            },
            data: {
                loggedIn : false
            }
        })
        if (!loggedUser) {
            return res.status(400).json({
                msg : "error logging out"
            })
        }
        return res.json({
            msg : "logged out!"
        })
    }
    catch (e) {
        error(e)
        return res.status(413).json({
            msg : "something went wrong!"
        })
    }
})

export default router