const User = require('../models/user')
const CommonFunctions = require('../utils/CommonFunctions')

const url = require('url');
const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator/check')

exports.getCreateUser = (req, res, next) => {
    if (req.session.isLoggedIn == true) {
        return res.render('users/profile', {
            isAuth: req.session.isLoggedIn,
            type_user:req.session.type_user,
        })
    }
    return res.render('users/create', {
        isAuth: req.session.isLoggedIn,
        type_user: req.session.type_user,
        name: '',
        email: '',
        phone: '',
        number_pattern: '',
        csrfToken: req.csrfToken()
    })
}


exports.postCreateUser = (req, res, next) => {
    const errors = validationResult(req)
    const name = req.body.name
    const email = req.body.email
    const password = req.body.password
    const phone = req.body.phone
    const number_pattern = req.body.number_pattern
    const token = req.body._csrf
    if(!errors.isEmpty()){
        console.log(errors.array())
        let nameError = ''
        let phoneError = ''
        let emailError = ''
        let passwordError = ''
        let password_confirmError = ''
        errors.array().forEach(function (obj) {
            if (obj.param == 'name') {
                nameError = obj.msg
            }
            if (obj.param == 'email') {
                emailError = obj.msg
            }
            if (obj.param == 'phone') {
                phoneError = obj.msg
            }
            if (obj.param == 'password_confirm') {
                password_confirmError = obj.msg
            }
            if (obj.param == 'password') {
                passwordError = obj.msg
            }
        })
        return res.status(422).render('users/create', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            name: name,
            email: email,
            phone: phone,
            number_pattern: number_pattern,
            csrfToken: token,
            nameError: nameError,
            emailError: emailError,
            phoneError: phoneError,
            password_confirmError: password_confirmError,
            passwordError: passwordError
        })
    }
    bcrypt.hash(password, 12)
        .then(hashedPassword => {
        const user = new User({
        name : name,
        email : email,
        password : hashedPassword,
        phone : phone,
        number_pattern : number_pattern,
        is_confirmed : false,
        confirmation:[{
            token:token
        }]
        })
        console.log(user)
        return user.save()
    })
        .then(result => {
            let here = "http://"+req.headers.host+"/confirm/email/"+token+"/"+CommonFunctions.EncodeBase64(email)
            const Message = {
              to: email,
              from: 'test@School.com',
              subject: 'Confirmation Account!!',
              html: '<strong>Please click <a href="'+here+'">here</a> for Confirm your account</strong>',
          }
        return CommonFunctions.Send(Message)
    }).then(info => {
        console.log('Message %s sent: %s', info.messageId, info.response);
        console.log('user is created ...!')
        return res.render('index',{
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            success_user: 'Your Account is created ...! Please check your inbox :)'
        })
    })
    .catch(err => console.log(err))
}

exports.getLogin = (req, res, next) => {
    console.log(req.query.confirm)
    if (req.session.isLoggedIn == true) {
        return res.redirect('/')
    }
    let email =''
    let success_confirmation = ''
    if (req.query.confirm) {
        const confirm = CommonFunctions.DecodeBase64(req.query.confirm)
        const query = confirm.split('|')
        success_confirmation = query[0]
        email = query[1];
    }

    return res.render('users/login', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            email: email,
            csrfToken: req.csrfToken(),
            success_confirmation: success_confirmation
        })
}
exports.postLogin = (req, res, next) => {
    const token = req.body._csrf
    const email = req.body.email
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let emailError = ''
        let passwordError = ''
        errors.array().forEach(function (obj) {
            if (obj.param == 'email') {
                emailError = obj.msg
            }
            if (obj.param == 'password') {
                passwordError = obj.msg
            }
        })
        console.log(passwordError, emailError)
        return res.status(422).render('users/login', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            email: email,
            csrfToken: token,
            emailError: emailError,
            passwordError: passwordError
        })
    }
    return res.redirect('/')

}

exports.getLogout = (req, res, next )=> {
    req.session.destroy(err => {
        console.log(err);
        req.user = null
        res.redirect('/');
    })
}

exports.getProfile = (req, res, next) => {
    if (req.session.isLoggedIn == true) {
        if (req.session.type_user == 'school') {
            return res.render('users/profile', {
                    csrfToken: req.csrfToken(),
                    isAuth: req.session.isLoggedIn,
                    type_user: req.session.type_user,
                    name: req.user.name,
                    email: req.user.email,
                    phone: req.user.phone,
                    number_pattern: req.user.number_pattern,
                    errorShow: 'no',
                })
        }else{
            return res.redirect('/profile/user')
        }
    }
    return res.redirect('/login')
}
exports.postProfile =  (req, res, next) => {
     const errors = validationResult(req)
     const name = req.body.name
     const phone = req.body.phone
     const number_pattern = req.body.number_pattern
     const token = req.body._csrf
     if (!errors.isEmpty()) {
         console.log(errors.array())
         let nameError = ''
         let phoneError = ''

         errors.array().forEach(function (obj) {
             if (obj.param == 'name') {
                 nameError = obj.msg
             }
             if (obj.param == 'phone') {
                 phoneError = obj.msg
             }
         })
         return res.status(422).render('users/profile', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            errorShow: 'yes',
            name: name,
            phone: phone,
            email: req.user.email,
            csrfToken: token,
            number_pattern: number_pattern,
            nameError: nameError,
            phoneError: phoneError,
         })
     }//else{
         User.findById({_id:req.user._id})
        .then( user=> {
            if(!user){
                 return res.redirect('/login')
            }
            user.name = name;
            user.phone = phone;
            user.number_pattern = number_pattern;
            req.user = user
            return user.save()
        })
        .then(result => {
            console.log('is updated....')
            return res.redirect('/profile')
        })
        .catch(err => console.log(err))
         //}
}
exports.getForgotPassword = (req, res, next) => {
    if (req.session.isLoggedIn == true) {
        return res.redirect('/profile/school')
    }
    return res.render('users/forgot_password', {
        isAuth: req.session.isLoggedIn,
        type_user: req.session.type_user,
        email: '',
        csrfToken: req.csrfToken()
    })
}
exports.postForgotPassword = (req, res, next) => {
    const errors = validationResult(req)
    const email = req.body.email
    const token = req.body._csrf
    if (!errors.isEmpty()) {
        let emailError = ''
        errors.array().forEach(function (obj) {
            if (obj.param == 'email') {
                emailError = obj.msg
            }
        })
        return res.status(422).render('users/forgot_password', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            email: email,
            csrfToken: token,
            emailError: emailError,
        })
    }
    let here = "http://" + req.headers.host + "/change/password/" + token + "/" + CommonFunctions.EncodeBase64(email)
    const Message = {
        to: email,
        from: 'test@School.com',
        subject: 'Confirmation Account!!',
        html: '<strong>Please click <a href="' + here + '">here</a> for Change your password</strong>',
    }
    CommonFunctions.Send(Message)
        .then(info => {
            console.log('Message %s sent: %s', info.messageId, info.response);
            console.log('Please check your inbox ...!')
            return res.render('users/forgot_password', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                success_confirmation: 'Link to change your password is sent ...! Please check your inbox :)',
                csrfToken: token,
                email: email
            })
        })

}

exports.setPassword = (req, res, next) => {
    req.session.email = req.params.email
    req.session.token = req.params.token
    User.findOne({email:CommonFunctions.DecodeBase64(req.params.email)}).then( user => {
        if(!user){
            return res.status(404).redirect('/404');
        }
        user.resetPassword[0] = {token:req.params.token}
        return user.save()
    }).then(result => {
        return res.redirect('/reset')
    }).catch( err=> console.log(err))
}

exports.resetPassword = (req, res, next) => {
    console.log(req.session.token)
    if ((req.session.token == undefined || req.session.email == undefined)) {
        return res.status(404).redirect('/404');
    }
    return res.render('users/forgot_password_form', {
        isAuth: req.session.isLoggedIn,
        type_user: req.session.type_user,
        csrfToken: req.csrfToken()
    })
}
exports.postResetPassword = (req, res, next) => {
    const errors = validationResult(req)
    const email = CommonFunctions.DecodeBase64(req.session.email)
    const token = req.session.token
    const password = req.body.password

     if (!errors.isEmpty()) {
         let passwordError = ''
         let password_confirmError = ''
         errors.array().forEach(function (obj) {
             if (obj.param == 'password') {
                 passwordError = obj.msg
             }
             if (obj.param == 'password_confirm') {
                 password_confirmError = obj.msg
             }
         })
         return res.status(422).render('users/forgot_password_form', {
             isAuth: req.session.isLoggedIn,
             type_user: req.session.type_user,
             csrfToken: token,
             passwordError: passwordError,
             password_confirmError: password_confirmError,
         })
     }
     var user;
     User.findOne({email:email})
        .then( userTemp => {
            if(!userTemp){
                return res.status(404).redirect('/404');
            }
            user = userTemp
            let tokenUser = userTemp.resetPassword[0].token
            if(tokenUser != token){
                return res.status(404).redirect('/404');
            }
           return  bcrypt.hash(password,12)
        }).then(hashedPassword => {
                user.password = hashedPassword
                user.resetPassword[0] = {
                    token: 'changed'
                }
                return user.save()
            }).then(result => {
                req.session.destroy()
                return res.render('users/login', {
                    isAuth: req.session.isLoggedIn,
                    type_user: req.session.type_user,
                    success_confirmation: 'Your password its changed with successfully :)',
                    csrfToken: req.csrfToken(),
                    email:email
                })
        }).catch( err=> console.log(err))
}
exports.setConfirmation = (req, res, next) => {
    const email = CommonFunctions.DecodeBase64(req.params.email);
    const token = req.params.token
    User.findOne({email:email, is_confirmed: false })
        .then( user => {
            if(!user){
              return res.status(404).redirect('/404');
            }
            const confirmation = user.confirmation[0]
            if (confirmation.token != token) {
               return res.status(404).redirect('/404');
            }
            user.is_confirmed = true
            user.save().then( result => {
                console.log('its confirmed !')
              //  return res.redirect('/login?valid='+string)
              const confirm = 'Your Account its confirmed ! :)|' + user.email
                return res.redirect(url.format({
                    pathname: "/login",
                    query: {
                        confirm: CommonFunctions.EncodeBase64(confirm)
                    }
                }));
            })
        })
        .catch(err => {
            console.log(err)
        })
}