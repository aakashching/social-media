const express = require('express')
const router = express.Router()
const UserModel = require('../models/UserModel')
const ProfileModel = require('../models/ProfileModel')
const FollowerModel = require('../models/FollowerModel')
const NotificationModel = require('../models/NotificationModel')
const ChatModel = require('../models/ChatModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const isEmail = require('validator/lib/isEmail')


const userPng =
  "https://res.cloudinary.com/indersingh/image/upload/v1593464618/App/user_mklcpl.png";
  const regexUserName = /^(?!.*\.\.)(?!.*\.$)[^\W][\w.]{0,29}$/;
router.get('/:username', async(req,res)=> {
    const {username} = req.params
    try {

        if(username.length<1) return res.status(401).send('invalid')
        if(!regexUserName.test(username)) return res.status(401).send('invalid')
        const user = await UserModel.findOne({username: username.toLowerCase()})
        if(user) return res.status(401).send('Username is already taken')

        return res.status(200).send('Available')
    } catch (error) {
        console.log(error)
        res.status(500).send('Server error')
    }
})

router.post('/', async(req,res)=>{
   const {
        name,
        email,
        password,
        username,
        bio,
        facebook,
        youtube,
        twitter,
        instagram
    } = req.body.user
    if(!isEmail(email)) return res.status(401).send('invalid Email')
    if(password.length<6) return res.status(401).send('password must be atleast six characters')
    try{
        let user;
        user =await UserModel.findOne({email: email.toLowerCase()})
        if(user) return res.status(401).send('User already registered')
        user = new UserModel({
            name, email: email.toLowerCase(), username: username.toLowerCase(), password,profilePicUrl: req.body.profilePicUrl || userPng
        })
        user.password = await bcrypt.hash(password,10)
        await user.save()

        let profileFields ={}
        profileFields.user = user._id
        profileFields.bio=bio

        profileFields.social={}
        if(facebook) profileFields.social.facebook=facebook
        if(youtube) profileFields.social.youtube=youtube
        if(twitter) profileFields.social.twitter=twitter
        if(instagram) profileFields.social.instagram=instagram

        await new ProfileModel(profileFields).save()

        await new FollowerModel({user: user._id, followers:[], following:[]}).save()
        await new NotificationModel({user: user._id, notifications: []}).save()
        await new ChatModel({user: user._id, chats: []}).save()

        const payload = {userId: user._id}
        jwt.sign(payload,process.env.JWT_SECRET,{expiresIn: '168h'},(err,token)=> {
            if(err) throw err
            return res.status(201).json(token)
        })

    } catch (error) {
        console.error(error)
        return res.status(500).send('Server Error')
    }
})

module.exports= router