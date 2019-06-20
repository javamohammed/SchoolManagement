const express =require('express')
const {body} = require('express-validator/check')
const userController = require('../controllers/user')
const csrf = require('csurf')

const User = require('../models/user')

const Route = express.Router()
var csrfProtection = csrf({ cookie: true })

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


module.exports = Route