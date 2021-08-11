const express = require('express')
const router = express.Router()
const UserModel = require('../models/UserModel')
const authMiddleware = require('../middleware/authMiddleware')
router.get('/:searchText',authMiddleware,async(req,res)=> {
    const {searchText} =  req.params
    if(searchText.length===0) return;
    try {
        const {userId} = req
        let userPattern = new RegExp(searchText)
        const results= await UserModel.find({name: {$regex: userPattern, $options: 'i'}})
        const resultsToBeSent = results.length>0 && results.filter(result=> result._id.toString() !== userId)
        res.json(resultsToBeSent)
    } catch (error) {
        console.error(error)
        res.status(500).send('server error')
    }
})


module.exports=router