const router = require("express").Router()
const auth = require("./auth.routes")
const payments = require("./payment.routers")
const portfolio = require("../models/portfolio.model");

router.use(auth)
router.use(payments)

router.get('/', async (req,res)=>{

    let data = await portfolio.findOne();
    let result = JSON.stringify(data)
    res.render('index',{data:JSON.parse(result)})
})

module.exports = router