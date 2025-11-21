const express = require("express");
const router = express.Router();

const auth = require("./auth.routes");
const payments = require("./payment.routers");
const fs = require("fs");
const path = require("path");

const SUPPORTED = ["tr", "en", "ru", "fr", "de", "es"];
const DEFAULT_LANG = "en";

// Çevirileri yükle
const innerText = {};
for (const lang of SUPPORTED) {
  const file = path.join(__dirname, "../locales", `${lang}.json`);
  innerText[lang] = JSON.parse(fs.readFileSync(file, "utf8"));
}

// Middleware: dil kontrol
// Middleware: dil kontrol
function lang(req, res, next) {
  const locale = req.params.locale;
  if (SUPPORTED.includes(locale)) {
    req.locale = locale;

    // "a.b.c" yollarını çözen yardımcı
    const getByPath = (obj, path) =>
      path.split('.').reduce((o, p) => (o && o[p] !== undefined ? o[p] : undefined), obj);

    res.locals.t = (key) => {
      const val =
        getByPath(innerText[locale], key) ??
        getByPath(innerText[DEFAULT_LANG], key) ??
        key; // bulunamazsa key'i göster
      return val;
    };

    res.locals.locale = locale;
    return next();
  }
  return res.redirect(`/${DEFAULT_LANG}`);
}


// ROOT isteği -> tarayıcı dilini kontrol et
router.get("/", (req, res) => {
  // Accept-Language header’ından ilk dili al
  const browserLang = req.acceptsLanguages(SUPPORTED) || DEFAULT_LANG;

  // Desteklenmiyorsa default’a git
  const targetLang = SUPPORTED.includes(browserLang) ? browserLang : DEFAULT_LANG;

  // Yönlendir
  return res.redirect(`/${targetLang}/`);
});

// locale kapsayıcı
const localeRouter = express.Router();

localeRouter.use(auth);       // -> /en/login
localeRouter.use(payments);   // -> /en/payments

localeRouter.get(["/", "/index"], (req, res) => {
  res.render("index");
});

// asıl bağlama
router.use("/:locale", lang, localeRouter);

module.exports = router;