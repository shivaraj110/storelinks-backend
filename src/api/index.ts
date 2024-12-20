import emojis from './emojis';
import signup from './signup'
import signin from './signin'
import express from 'express';
import personal from './personalLinks'
const router = express.Router(); 
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
import MessageResponse from '../interfaces/MessageResponse';
router.get<{}, MessageResponse>('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏',
  });
});
router.use('/user/signup',signup)
router.use('/personal',personal)
router.use('/user/signin',signin)
router.use('/emojis', emojis);
router.get('/test',(req,res)=>{
  const age = req.body.age
  let isAllowed = false
  if(age > 18){
isAllowed = true
}
const msgg = isAllowed ? "allowed to vote " : "not allowed"
  return res.json({
msgg,
msg: req.body.name
  })
})
export default router;
