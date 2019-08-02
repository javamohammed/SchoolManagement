const express =require('express')
const {body} = require('express-validator/check')
const userController = require('../controllers/user')
const csrf = require('csurf')
const bcrypt = require('bcryptjs')

const User = require('../models/user')
const isAuth = require('../middleware/is-auth')

const Route = express.Router()
var csrfProtection = csrf({ cookie: true })
var user;
Route.get('/create', csrfProtection, userController.getCreateUser)
Route.post('/create',[
    body('email').isEmail().withMessage('Email is invalid').normalizeEmail(),
    body('name').isLength({min:5}).withMessage('Name should be more than 5 characters').trim(),
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
        return User.findOne({email:email}).then( user  => {
            if(user){
                return Promise.reject('E-mail already in use')
            }
        })
    })
], csrfProtection, userController.postCreateUser)

Route.get('/login',csrfProtection, userController.getLogin)
Route.post('/login',[
    body('email').isEmail().withMessage('Email is invalid').normalizeEmail(),
   	body('email').custom((value,{req}) => {
       return  User.findOne({email: value, is_confirmed:true}).then(userTmp => {
            if(!userTmp){
                return Promise.reject('User in exists !!')
            }
            user = userTmp
        })
    }),
    body('password').custom((value, {req}) => {
        return bcrypt.compare(value, user.password).then(res => {
            if (res == false) {
                console.log(res)
                return Promise.reject('Password incorrect !!')
            }
            req.session.isLoggedIn =  true
            req.session.user = user
            req.session.type_user = 'school'
        })

    })
], csrfProtection, userController.postLogin)

Route.get('/confirm/email/:token/:email', userController.setConfirmation)
Route.get('/logout', userController.getLogout)

Route.post('/profile', [
    body('name').isLength({min:5}).withMessage('Name should be more than 5 characters').trim(),
    body('phone').isLength({min:10, max:10}).withMessage('Number phone should be equals 10 characters').trim(),
    body('phone').isNumeric().withMessage('Number phone should be a number'),
], csrfProtection, userController.postProfile)
Route.get('/profile',csrfProtection, userController.getProfile)

Route.get('/forgotpassword', csrfProtection, userController.getForgotPassword)

Route.post('/forgotpassword', [
    body('email').isEmail().withMessage('Email is invalid').normalizeEmail(),
   	body('email').custom((value,{req}) => {
       return  User.findOne({email: value, is_confirmed:true}).then(userTmp => {
            if(!userTmp){
                return Promise.reject('User in exists !!')
            }
            //code...
        })
    })
], csrfProtection, userController.postForgotPassword)


Route.get('/change/password/:token/:email', csrfProtection, userController.setPassword)
Route.get('/reset', csrfProtection, userController.resetPassword)
Route.post('/reset',[
     body('password').isLength({min:6}).withMessage('Password should be more than 6 characters').trim(),
    body('password_confirm').custom((value, {req}) => {
        console.log(req.body.password)
        console.log(value)
        if (value != req.body.password) {
            throw new Error('Password confirmation is incorrect')
        }else{
            return true
        }
    })
], csrfProtection, userController.postResetPassword)
module.exports = Route