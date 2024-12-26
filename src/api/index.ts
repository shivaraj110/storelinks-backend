import emojis from './emojis';
import signup from './signup'
import signin from './signin'
import express from 'express';
import personal from './personalLinks'
import studymaterials from './studymaterials'
import softwares from './softwares'
import scholarships from './scholarships'
import hackathons from './hackathons'
import logout from './logout'
import jobs from './jobs'
import profile from './profile'
const router = express.Router(); 
router.use('/profile',profile)
router.use('/user/signup',signup)
router.use('/user/logout',logout)
router.use('/personal',personal)
router.use('/user/signin',signin)
router.use('/public/studymaterials',studymaterials)
router.use('/public/softwares', softwares)
router.use('/public/scholarships',scholarships)
router.use('/public/hackathons',hackathons)
router.use('/public/jobs',jobs)
router.use('/emojis', emojis);

export default router;
