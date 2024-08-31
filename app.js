require("express-async-errors")
const express = require("express")
const app = express()
require("dotenv").config()
require("./src/db/dbConnection")
const port = process.env.PORT || 5001
const router = require("./src/routers")
const errorHandlerMiddleware = require("./src/middlewares/errorHandler")
const cors = require("cors")
const corsOptions = require("./src/helpers/corsOptions")
const mongoSanitize = require('express-mongo-sanitize');
const path = require("path")
const apiLimiter = require("./src/middlewares/rateLimit")
const session = require("express-session");
const moment = require("moment-timezone")
moment.tz.setDefault("Europe/Istanbul")

app.set('views', path.join(__dirname, "src/views"));
app.set("view engine", "ejs");
app.use(express.static("src/public"));
app.use(
    session({
        secret: process.env.EJS_ROUTER_SECRET ? process.env.EJS_ROUTER_SECRET.split(",") : ["Keyboard Cat :3 Meow", "0xDEADBEEF"],
        resave: false,
        saveUninitialized: true,
        cookie: { maxAge: 3600000 },
    })
);

// Middlewares
app.use(express.json())
app.use(express.json({limit: "50mb"}))
app.use(express.urlencoded({limit: "50mb", extended: true, parameterLimit: 50000}))

app.use(express.static(path.join(__dirname, "public")))

app.use(cors(corsOptions))

app.use(apiLimiter)

app.use(
    mongoSanitize({
      replaceWith: '_',
    }),
);

app.use(router)

// hata yakalama
app.use(errorHandlerMiddleware)

app.listen(port, () => {
    console.log(`Server ${port} portundan çalışıyor ...`);
})