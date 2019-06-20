const User = require('../models/user')

const bcrypt = require('bcryptjs')
const {validationResult} = require('express-validator/check')
exports.getCreateUser = (req, res, next) => {
    console.log('csrfToken',req.csrfToken())
    return res.render('users/create',{
        name : '',
        email : '',
        phone : '',
        number_pattern : '',
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
        console.log('emailError => ', emailError)
        return res.status(422).render('users/create', {
            name: name,
            email: email,
            phone: phone,
            number_pattern: number_pattern,
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
        })
        console.log(user)
        return user.save()
    })
        .then(result => {
        console.log('user is created ...!')
        return res.redirect('/')
    })
        .catch(err => console.log(err))
}