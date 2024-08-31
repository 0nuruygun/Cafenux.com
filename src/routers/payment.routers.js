const router = require("express").Router();
const { payment } = require("../controllers/payment.controller");

router.post("/payment", payment);

router.get('/payment',(req,res)=>{
    res.render('payment')
})

module.exports = router;
