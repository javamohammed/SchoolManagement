const User = require('../models/user')
const UserSchool = require('../models/UserSchool')
const CommonVars = require('../utils/CommonVars')
const CommonFunctions = require('../utils/CommonFunctions')

const {validationResult} = require('express-validator/check')
const url = require('url');
const fs = require('fs')
const bcrypt = require('bcryptjs')

exports.getCreateAccount = (req, res, next) => {

    CommonFunctions.Schools().then(Schools => {
         return res.render('userSchool/create', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                names_schools: Schools,
                first_name: 'Karim',
                last_name: 'Alfred',
                email: 'test@gmail.com',
                birthday: '2015-01-01',
                identity: '00000',
                types_doc: CommonVars.types_doc,
                types_users: CommonVars.types_users,
                phone: '02022222',
                number_pattern: '1021212',
                csrfToken: req.csrfToken()
                })
            }).catch( err => console.log(err))
}

exports.postCreateAccount = (req, res, next) => {

    const id_school = req.body.name_school
    const email = req.body.email
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const birthday = req.body.birthday
    const identity = req.body.identity
    const type_doc = req.body.type_doc
    const type_user_school = req.body.type_user
    const password = req.body.password
    const phone = req.body.phone
    const token = req.body._csrf
    let image_url_doc = ''
    let image_docError = ''
    if ( !req.file) {
        //image_url_doc = req.file.path
        image_docError = 'Please upload your Image document'
    }

    const errors = validationResult(req)
     if (!errors.isEmpty()) {
        let first_nameError = ''
        let last_nameError = ''
        let school_nameError = ''
        let birthdayError = ''
        let identityError = ''
        let type_docError = ''
        let type_userError = ''
        let emailError = ''
        let phoneError = ''
        let passwordError = ''
        let password_confirmError = ''
        errors.array().forEach(function (obj) {
            if (obj.param == 'first_name') {
                first_nameError = obj.msg
            }
            if (obj.param == 'last_name') {
                last_nameError = obj.msg
            }
            if (obj.param == 'name_school') {
                school_nameError = obj.msg
            }
            if (obj.param == 'birthday') {
                birthdayError = obj.msg
            }
            if (obj.param == 'identity') {
                identityError = obj.msg
            }
            if (obj.param == 'type_doc') {
                type_docError = obj.msg
            }
            if (obj.param == 'type_user') {
                type_userError = obj.msg
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
            CommonFunctions.Schools().then(Schools => {
                return res.status(422).render('userSchool/create', {
                    isAuth: req.session.isLoggedIn,
                    type_user:req.session.type_user,
                    names_schools: Schools,
                    first_name: first_name,
                    last_name: last_name,
                    email: email,
                    csrfToken: token,
                    name_school: id_school,
                    birthday: birthday,
                    identity: identity,
                    types_doc: CommonVars.types_doc,
                    types_users: CommonVars.types_users,
                    phone: phone,
                    //Errors
                    first_nameError: first_nameError,
                    image_docError: image_docError,
                    last_nameError: last_nameError,
                    emailError: emailError,
                    school_nameError: school_nameError,
                    birthdayError: birthdayError,
                    identityError: identityError,
                    type_docError: type_docError,
                    type_userError: type_userError,
                    phoneError: phoneError,
                    password_confirmError: password_confirmError,
                    passwordError: passwordError
            })
            }).catch(err => console.log(err))


     }else{
        bcrypt.hash(password, 12)
            .then(hashedPassword => {
                if (req.file) {
                    image_url_doc = req.file.path
                }
                const user_School = new UserSchool({
                    id_school: id_school,
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    birthday: birthday.trim(),
                    identity: identity,
                    type_doc: type_doc,
                    image_url_doc: image_url_doc,
                    image_url_avatar: 'images/avatar.png',
                    type_user_school: type_user_school,
                    password: hashedPassword,
                    is_confirmed: false,
                    phone: phone,
                    confirmation: [{
                        token: token
                    }]
                })
                console.log(user_School)
                return user_School.save()
            })
            .then(result => {
                let here = "http://" + req.headers.host + "/confirm/account/" + token + "/" + CommonFunctions.EncodeBase64(email)
                const Message = {
                    to: email,
                    from: 'test@School.com',
                    subject: 'Confirmation Account!!',
                    html: '<strong>Please click <a href="' + here + '">here</a> for Confirm your account</strong>',
                }
                return CommonFunctions.Send(Message)
            }).then(info => {
                console.log('Message %s sent: %s', info.messageId, info.response);
                console.log('user is user_School ...!')
                return res.render('index', {
                    isAuth: req.session.isLoggedIn,
                    type_user: req.session.type_user,
                    success_user: 'Your Account is created ...! Please check your inbox :)'
                })
            })
            .catch(err => console.log(err))
     }

    console.log(req.body.name_school)
   // console.log(req.file.path)
}

exports.setConfirmation = (req, res, next) => {
     const email = CommonFunctions.DecodeBase64(req.params.email);
     const token = req.params.token
     let userSchoolTmp;
      UserSchool.findOne({
             email: email,
             /*is_confirmed: false*/
         })
         .then(userSchool => {
             if (!userSchool) {
                 return res.status(404).redirect('/404');
             }
             const confirmation = userSchool.confirmation[0]
             if (confirmation.token != token) {
                 return res.status(404).redirect('/404');
             }
             userSchool.is_confirmed = true
             userSchoolTmp = userSchool
             return userSchool.save()
         })
         .then(result => {
                 console.log('its confirmed !')
                 const confirm = 'Your Account its confirmed ! :)|' + userSchoolTmp.email
                 return res.redirect(url.format({
                     pathname: "/login/user",
                     query: {
                         confirm: CommonFunctions.EncodeBase64(confirm)
                     }
                 }));
             })
         .catch(err => {
             console.log(err)
         })
}


exports.getLogin = (req, res, next) => {
    if(req.session.isLoggedIn == true){
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

    CommonFunctions.Schools().then(Schools => {
         return res.render('userSchool/login', {
             isAuth: req.session.isLoggedIn,
             type_user: req.session.type_user,
             names_schools: Schools,
             email: email,
             csrfToken: req.csrfToken(),
             success_confirmation: success_confirmation
         })
    }).catch(err => console.log(err))

}
exports.postLogin = (req, res, next) => {
    const token = req.body._csrf
    const email = req.body.email
    const id_school = req.body.name_school
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        let emailError = ''
        let passwordError = ''
        let school_nameError = ''
        errors.array().forEach(function (obj) {
            if (obj.param == 'email') {
                emailError = obj.msg
            }
            if (obj.param == 'password') {
                passwordError = obj.msg
            }
            if (obj.param == 'name_school') {
                school_nameError = obj.msg
            }
        })
        CommonFunctions.Schools().then(Schools => {
            return res.status(422).render('userSchool/login', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                names_schools: Schools,
                email: email,
                csrfToken: token,
                emailError: emailError,
                passwordError: passwordError,
                school_nameError: school_nameError,
            })
        }).catch(err => console.log(err))

    }else{
        return res.redirect('/')
    }

}

exports.getLogout = (req, res, next) => {
    req.session.destroy(err => {
        console.log(err);
        req.user =  null
        res.redirect('/');
    })
}
exports.getProfile = (req, res, next) => {
    if (req.session.isLoggedIn == true) {
        return res.render('userSchool/profile', {
            csrfToken: req.csrfToken(),
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            phone: req.user.phone,
            identity: req.user.identity,
            type_doc: req.user.type_doc,
            birthday: req.user.birthday,
            image_url_doc: req.user.image_url_doc,
            type_user_school: req.type_user_school,
            image_url_avatar: req.user.image_url_avatar,
            errorShow: 'no',
        })

    }
    return res.redirect('/login/user')
}

exports.postProfile = (req, res, next) => {
    const errors = validationResult(req)
    const first_name = req.body.first_name
    const last_name = req.body.last_name
    const phone = req.body.phone
    const token = req.body._csrf
    //console.log(first_name, last_name, phone)
    if (!errors.isEmpty()) {
        //console.log(errors.array())
        let first_nameError = ''
        let phoneError = ''
        let last_nameError = ''

        errors.array().forEach(function (obj) {
            if (obj.param == 'first_name') {
                first_nameError = obj.msg
            }
            if (obj.param == 'last_name') {
                last_nameError = obj.msg
            }
            if (obj.param == 'phone') {
                phoneError = obj.msg
            }
        })
        return res.status(422).render('userSchool/profile', {
            csrfToken: token,
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            first_name: first_name,
            last_name: last_name,
            email: req.user.email,
            phone: phone,
            image_url_avatar: req.user.image_url_avatar,
            identity: req.user.identity,
            type_doc: req.user.type_doc,
            birthday: req.user.birthday,
            image_url_doc: req.user.image_url_doc,
            type_user_school: req.type_user_school,
            first_nameError: first_nameError,
            last_nameError: last_nameError,
            phoneError: phoneError,
            errorShow: 'yes',
        })
    }else{
         UserSchool.findById({_id:req.user._id})
        .then(userSchool=> {
            if (!userSchool) {
                return res.redirect('/login/user')
            }
            let image_url_avatar = userSchool.image_url_avatar
            if (req.file) {
                if (!image_url_avatar.includes("avatar.png") && !image_url_avatar.includes("images")) {
                    fs.unlink(image_url_avatar, (err) => console.log(err) )
                }
                image_url_avatar = req.file.path
            }
            userSchool.first_name = first_name
            userSchool.last_name = last_name
            userSchool.phone = phone
            userSchool.image_url_avatar = image_url_avatar
            req.user = userSchool
            return userSchool.save()
        }).then(result => {
            console.log('is updated....')
            return res.redirect('/profile/user')
        })
        .catch(err => console.log(err))
    }
}