const login = function (req, res) {
    res.render("login")
}

const loginPost = function (req, res) {
    if (req.session.user) {
        res.redirect('/')
    }
    else
        res.render('login', { success: false, message: req.mess })
}

const logout = function (req, res, next) {
    // logout logic

    // clear the user from the session object and save.
    // this will ensure that re-using the old session id
    // does not have a logged in user
    req.session.user = null
    req.session.save(function (err) {
        if (err) next(err)

        // regenerate the session, which is good practice to help
        // guard against forms of session fixation
        req.session.regenerate(function (err) {
            if (err) next(err)
            res.redirect('/')
        })
    })
}

const register = function (req, res) {
    res.render('register')
}

const registerPost = function (req, res) {
    res.render('register', { success: false, message: req.mess })
}


const forgetPassword = async (req, res) => {
    const { email } = req.body;
  
    const userInfo = await user
      .findOne({ email })
      .select(" name lastname email ");
  
    if (!userInfo) return new APIError("Geçersiz Kullanıcı", 400);
  
    console.log("userInfo : ", userInfo);
  
    const resetCode = crypto.randomBytes(3).toString("hex");
  
    console.log(resetCode);
  
    // await sendEmail({
    //     from: "base.api.proje@outlook.com",
    //     to: userInfo.email,
    //     subject: "Şifre Sıfırlama",
    //     text: `Şifre Sıfırlama Kodunuz ${resetCode}`
    // })
  
    await user.updateOne(
      { email },
      {
        reset: {
          code: resetCode,
          time: moment(new Date())
            .add(15, "minute")
            .format("YYYY-MM-DD HH:mm:ss"),
        },
      }
    );
  
    return new Response(true, "Lütfen Mail Kutunuzu Kontrol Ediniz").success(res);
  };
  
  const resetCodeCheck = async (req, res) => {
    const { email, code } = req.body;
  
    const userInfo = await user
      .findOne({ email })
      .select("_id name lastname email reset");
  
    if (!userInfo) throw new APIError("Geçersiz Kod !", 401);
  
    const dbTime = moment(userInfo.reset.time);
    const nowTime = moment(new Date());
  
    const timeDiff = dbTime.diff(nowTime, "minutes");
  
    console.log("Zaman farkı : ", timeDiff);
  
    if (timeDiff <= 0 || userInfo.reset.code !== code) {
      throw new APIError("Geçersiz Kod", 401);
    }
  
    const temporaryToken = await createTemporaryToken(
      userInfo._id,
      userInfo.email
    );
  
    return new Response(
      { temporaryToken },
      "Şifre Sıfırlama Yapabilirsiniz"
    ).success(res);
  };
  
  const resetPassword = async (req, res) => {
    const { password, temporaryToken } = req.body;
  
    const decodedToken = await decodedTemporaryToken(temporaryToken);
    console.log("decodedToken : ", decodedToken);
  
    const hashPassword = await bcrypt.hash(password, 10);
  
    await user.findByIdAndUpdate(
      { _id: decodedToken._id },
      {
        reset: {
          code: null,
          time: null,
        },
        password: hashPassword,
      }
    );
  
    return new Response(decodedToken, "Şifre Sıfırlama Başarılı").success(res)
  };

module.exports = {
    login,
    loginPost,
    logout,
    register,
    registerPost,
    forgetPassword,
    resetCodeCheck,
    resetPassword
};