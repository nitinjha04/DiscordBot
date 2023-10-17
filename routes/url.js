const urlModel = require("../models/url")
const express= require("express");

const router = express.Router();

router.get('/:shortId',async(req,res)=>{
    const {shortId} = req.params
    const entry = await urlModel.findOne({
        shortId,
    })
    res.redirect('http://' + entry.redirectURL)

})

module.exports = router
