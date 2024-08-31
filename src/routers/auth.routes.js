const router = require("express").Router();

const { login, 
        loginPost, 
        logout, 
        register, 
        registerPost, 
        forgetPassword,
        resetCodeCheck,
        resetPassword 
} = require("../controllers/user.controller");

const { isAuthenticated, loginVerify, registerUser } = require("../middlewares/checkAuth");

/**
 * @typedef {import("express").Request} EJSRequest
 * @typedef {import("express").Response} EJSResponse
 * @typedef {import("express").NextFunction} EJSNextError
 */

/**
 * Whether to send a vague error to client on 'handleErrors'. A non-vague error is outputted to the console instead.
 */
const sendVagueError = process.env.DEBUG ?? true;

/**
 * Creates a by-default exception handling ExpressJS routing callback, to avoid the server from crashing on any error / inconvenience.
 *
 * This will send a 500 status code by default, you can probably intercept the ExpressJS next with a middleware.
 * @template TFnReturnType Type that the 'fn' function returns. This can declare a Promise, which the ExpressJS will wait.
 * @param {function(EJSRequest, EJSResponse, EJSNextError?):TFnReturnType} fn The function to call with the request and the response.
 * @param {function(Error|any):void} onError Callback called when the error is directed to the ExpressJS.
 * @returns {function(EJSRequest, EJSResponse, EJSNextError):TFnReturnType}
 */
function handleErrors(fn, onError = null) {
    if (fn === null || fn === undefined) {
        throw new Error("[index::handleErrors] Given 'fn' variable is null or undefined. Cannot handle any error.");
    }

    return (req, res, next) => {
        function sendError(e) {
            if (sendVagueError) {
                next(new Error("[handleErrors] An error occured."));
                // print server side instead
                console.error("[--- handleErrors ---]");
                console.error(e);
                console.error("[--- handleErrors ---]");
            } else {
                next(e);
            }

            if (onError && typeof onError !== "boolean") {
                onError(e);
            }
        }

        try {
            const result = fn.length >= 3 ? fn(req, res, next) : fn(req, res);
            if (result instanceof Promise) {
                result.catch((e) => {
                    sendError(e);
                });
            }
            return result;
        } catch (e) {
            sendError(e);
        }
    };
}

router.get("/login", handleErrors(login));

router.get("/logout", handleErrors(logout));

router.get("/register", handleErrors(register));

router.post("/login", handleErrors(loginVerify), handleErrors(loginPost));

router.post("/register", handleErrors(registerUser), handleErrors(registerPost));

router.post("/forget-password", forgetPassword);

router.post("/reset-code-check", resetCodeCheck);

router.post("/reset-password", resetPassword)


module.exports = router;

