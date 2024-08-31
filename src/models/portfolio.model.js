const { number } = require("joi")
const mongoose = require("mongoose")

const userShema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        trim: true
    },
    home: {
        type: Object
    },
    about: {
        type: Object
    },
    resume: {
        type: Object
    },
    portfolio: {
        type: Object
    },
    blog: {
        type: Object
    },
    contact: {
        type: Object
    },
    social: {
        type: Object
    }
    
},{collection: "portfolio", timestamps: true})

const portfolio = mongoose.model("portfolio", userShema)

module.exports = portfolio