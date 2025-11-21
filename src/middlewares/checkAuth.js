/**
 * @typedef {import("express").Request} EJSRequest
 * @typedef {import("express").Response} EJSResponse
 * @typedef {import("express").NextFunction} EJSNextError
 */

/**
 * @param {EJSRequest} req
 * @param {EJSResponse} _res
 */
const reCaptcha = async function (capToken, remoteAddress) {
    try {
        if (!capToken || capToken === undefined || capToken === "" || capToken === null) {
            return { success: false, message: "Lütfen doğrulamayı tamamlayın." };
        }

        const secretKey = process.env.CAPTCHA_SEC;

        // Google reCAPTCHA v3 doğrulama URL
        const verifyUrl = "https://www.google.com/recaptcha/api/siteverify";

        // POST parametreleri
        const params = new URLSearchParams();
        params.append("secret", secretKey);
        params.append("response", capToken);
        if (remoteAddress) {
            params.append("remoteip", remoteAddress);
        }

        const response = await fetch(verifyUrl, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: params
        });

        const result = await response.json();

        if (!result.success) {
            return { success: false, message: "Captcha doğrulaması yapılamadı.", details: result };
        }

        // İsteğe bağlı ek kontroller (v3 için)
        // if (result.action !== "login" || result.score < 0.5) {
        //     return { success: false, message: "Şüpheli etkinlik algılandı.", details: result };
        // }

        return { success: true, details: result };
    } catch (err) {
        console.error("reCAPTCHA doğrulama hatası:", err);
        return { success: false, message: "Sunucu hatası." };
    }
};
/**
 * @param {Object} data 
 * @param {string} url 
 * @returns {Promise<any>}
 */
const postData = async function (data, url) {
    try {
        const response = await fetch(process.env.AUTHURL + url, {
            method: "POST", // *GET, POST, PUT, DELETE, etc.
            mode: "cors", // no-cors, *cors, same-origin
            cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
            credentials: "same-origin", // include, *same-origin, omit
            headers: {
                "Content-Type": "application/json",
                // 'Content-Type': 'application/x-www-form-urlencoded',
            },
            redirect: "follow", // manual, *follow, error
            referrerPolicy: "no-referrer", // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
            body: JSON.stringify(data), // body data type must match "Content-Type" header
        });
        // req.mess =  response.json(); // parses JSON response into native JavaScript objects
        return response.json();
    } catch (err) {
        console.log(err);
    }
};

/**
 * @param {EJSRequest} req
 * @param {EJSResponse} _res
 * @param {EJSNextError} next
 */
const loginVerify = async (req, _res, next) => {

    let capt = await reCaptcha(req.body.recaptchaToken, req.socket.remoteAddress);
    if (capt.success === true) {

        await postData({ email: req.body.user, password: req.body.pass }, "api/login").then((data) => {
            if (!(data === undefined)) {
                if (data.success === true) {
                    req.session.user = req.body.user;
                    req.session.token = data.token;
                    //onlineUsers.push({ sessionId: req.sessionID, roomId: data.roomId });
                } else {
                    req.mess = data.message;
                }
            } else {
                req.mess = "Sunucudan yanıt alınamadı.";
            }
        });
        
    } else {
        req.mess = capt.message;
    }
    next();
};

/**
 * @param {EJSRequest} req
 * @param {EJSResponse} _res
 * @param {EJSNextError} next
 */
const registerUser = async (req, _res, next) => {
    let capt = await reCaptcha(req.body.recaptchaToken, req.socket.remoteAddress);
    
        if (capt.success === true) {
            await postData({ name: req.body.name, lastname: req.body.surname, email: req.body.email, password: req.body.pass }, "api/register").then((data) => {
                if (!(data === undefined)) {
                    if (data.success === true) {
                        req.session.user = req.body.user;
                        req.session.token = data.token;
                    } else {
                        req.mess = data.message;
                    }
                } else {
                    req.mess = "Sunucudan yanıt alınamadı.";
                }
            });
        } else {
            req.mess = capt.message;
        }

    next();
};

/**
 * @param {EJSRequest} req
 * @param {EJSResponse} _res
 * @param {EJSNextError} next
 */
//var checkTcNum = function (value) {
//    value = value.toString();
//    var isEleven = /^[0-9]{11}$/.test(value);
//    var totalX = 0;
//    for (var i = 0; i < 10; i++) {
//        totalX += Number(value.substr(i, 1));
//    }
//    var isRuleX = totalX % 10 == value.substr(10, 1);
//    var totalY1 = 0;
//    var totalY2 = 0;
//    for (var i = 0; i < 10; i += 2) {
//        totalY1 += Number(value.substr(i, 1));
//    }
//    for (var i = 1; i < 10; i += 2) {
//        totalY2 += Number(value.substr(i, 1));
//    }
//    var isRuleY = ((totalY1 * 7) - totalY2) % 10 == value.substr(9, 0);
//    return isEleven && isRuleX && isRuleY;
//  };

/**
 * @param {EJSRequest} req
 * @param {EJSResponse} res
 * @param {EJSNextError} next
 */
const isAuthenticated = async (req, res, next) => {
    if (req.session.user) {
        await fetch(process.env.AUTHURL + "api/me", {
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                mode: "no-cors",
                Authorization: "Bearer " + req.session.token,
            },
            method: "get",
        }).then(async function (data) {
            data = await data.json();
            req.session = data;
            // await next(); 
            next();
        });
    } else {
        res.redirect("/login");
    }

    next();
};

module.exports = {
    isAuthenticated,
    loginVerify,
    registerUser,
};
