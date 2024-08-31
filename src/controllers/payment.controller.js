
const Iyzipay = require('iyzipay');
const { v4: uuidv4 } = require('uuid');
const Response = require('../utils/response')

const payment = async (req,res) => {
    const id = uuidv4();
    const {
        price, 
        cardHolderName,
        cardNumber,
        expireMonth,
        expireYear,
        cvc
    } = req.body;

    var iyzipay = new Iyzipay({
        apiKey: process.env.IYZIPAY_API_KEY,
        secretkey: process.env.IYZIPAY_SECRET_KEY,
        uri: 'https://sandbox-api.iyzipay.com'
    });


    var data = {
        locale: "TR",
        conversationId: id,
        price,
        paidPrice: price,
        currency: "TRY",
        installment: '1',
        paymentChannel: "WEB",
        paymentGroup: "PRODUCT",
        paymentCard: {
            cardHolderName,
            cardNumber,
            expireMonth,
            expireYear,
            cvc
        },
        buyer: {
            id: 'BY789',
            name: 'John',
            surname: 'Doe',
            gsmNumber: '+905350000000',
            email: 'email@email.com',
            identityNumber: '74300864791',
            lastLoginDate: '2015-10-05 12:43:35',
            registrationDate: '2013-04-21 15:12:09',
            registrationAddress: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            ip: '85.34.78.112',
            city: 'Istanbul',
            country: 'Turkey',
            zipCode: '34732'
        },
        shippingAddress: {
            contactName: 'Jane Doe',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            zipCode: '34742'
        },
        billingAddress: {
            contactName: 'Jane Doe',
            city: 'Istanbul',
            country: 'Turkey',
            address: 'Nidakule Göztepe, Merdivenköy Mah. Bora Sok. No:1',
            zipCode: '34742'
        },
        basketItems: [
            {
                id: 'BI101',
                name: 'Binocular',
                category1: 'Collectibles',
                category2: 'Accessories',
                itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
                price
            }
        ]
    };

    iyzipay.payment.create(data, async function (err, result) {
        res.send(result)
    });
    
}

module.exports = {
    payment
}