const express = require('express')
const csrf = require('csurf')
const {body} = require('express-validator/check')
const bcrypt = require('bcryptjs')

const UserSchoolController = require('../controllers/UserSchool')
const User = require('../models/user')
const UserSchool = require('../models/UserSchool')
const CommonVars = require('../utils/CommonVars')
const isAuth = require('../middleware/is-auth')
const Router = express.Router()
var csrfProtection = csrf({ cookie: true })
var user;

Router.get('/create/account', csrfProtection, UserSchoolController.getCreateAccount)
Router.post('/create/account',[
    body('email').isEmail().withMessage('Email is invalid').normalizeEmail(),
    body('birthday').custom((value) => {
        if(!value.match(/^\d{4}-\d{2}-\d{2}$/)){
             throw new Error('Birthday is invalid')
        }else{
            let year = value.split('-')[0]
            if (parseInt(year) > 2015 || parseInt(year) < 1900) {
                throw new Error('Birthday is invalid')
            }
            return true
        }

    }),
    body('first_name').isLength({min:5}).withMessage('First Name should be more than 5 characters').trim(),
    body('last_name').isLength({min:5}).withMessage('Last Name should be more than 5 characters').trim(),
    body('identity').isLength({min:5}).withMessage('Identity should be more than 5 characters').trim(),
    body('phone').isNumeric(),
    body('type_doc').custom((value,{req}) => {
        if (!CommonVars.types_doc.includes(value)) {
             throw new Error('Please choose a valid document ')
        }
        return true
    }),
    body('type_user').custom((value,{req}) => {
        if (!CommonVars.types_users.includes(value)) {
             throw new Error('Please choose a valid Type of user ')
        }
        return true
    }),
    body('password').isLength({min:6}).withMessage('Password should be more than 6 characters').trim(),
    body('password').custom((value, {req}) => {
    console.log(req.body.password_confirm)
    console.log(value)
    if (value != req.body.password_confirm) {
        throw new Error('Password confirmation is incorrect')
    }else{
        return true
    }
    }),
    body('email').custom(email => {
        return UserSchool.findOne({email:email}).then( user  => {
            if(user){
                return Promise.reject('E-mail already in use')
            }
        })
    }),
    body('name_school').custom(value => {
        return User.findOne({_id:value.toString()}).then( user  => {
            if(!user){
                return Promise.reject('This school is not exists !')
            }
        })
    })

], UserSchoolController.postCreateAccount)
Router.get('/confirm/account/:token/:email', UserSchoolController.setConfirmation)
Router.get('/login/user', csrfProtection, UserSchoolController.getLogin)

Router.post('/login/user', [
    body('email').isEmail().withMessage('Email is invalid').normalizeEmail(),
    body('email').custom((value, {
        req
    }) => {
        return UserSchool.findOne({
            email: value,
            is_confirmed: true
        }).then(userTmp => {
            if (!userTmp) {
                return Promise.reject('User in exists !!')
            }
            user = userTmp
        })
    }),
    body('password').custom((value, {
        req
    }) => {
        return bcrypt.compare(value, user.password).then(res => {
            if (res == false) {
                console.log(res)
                return Promise.reject('Password incorrect !!')
            }
            req.session.isLoggedIn = true
            req.session.user = user
            req.session.type_user = 'not_school'
        })

    }),
    body('name_school').custom(value => {
        return User.findOne({_id:value.toString()}).then( user  => {
            if(!user){
                return Promise.reject('Please choose The right school !')
            }
        })
    })
], csrfProtection, UserSchoolController.postLogin)
Router.get('/profile/user', csrfProtection, UserSchoolController.getProfile)
Router.post('/profile/user',[
    body('first_name').isLength({min:5}).withMessage('First Name should be more than 5 characters').trim(),
    body('last_name').isLength({min:5}).withMessage('Last Name should be more than 5 characters').trim(),
    body('phone').isLength({min:10, max:10}).withMessage('Number phone should be equals 10 characters').trim(),
    body('phone').isNumeric().withMessage('Number phone should be a number'),
], csrfProtection, UserSchoolController.postProfile)
module.exports = Router