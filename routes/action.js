const express = require('express')
const csrf = require('csurf')
const {body} = require('express-validator/check')

const actionsController = require('../controllers/action')
const isAuth = require('../middleware/is-auth')
const Subject = require('../models/subject')
const Route = express.Router()
var csrfProtection = csrf({ cookie: true })

Route.get('/actions',actionsController.getMenu)
Route.get('/subject/add',isAuth, csrfProtection, actionsController.getAddSubject)
Route.post('/subject/add',[
    body('label').isLength({min:5}).withMessage('Label should be more than 5 characters').trim(),
    body('label').custom((label, {req}) => {
       return Subject.findOne({label:label, userId: req.user._id})
        .then( subject => {
            if(subject){
                return Promise.reject('This Subject already created')
            }
            return true
        })
    } )
    ], isAuth, csrfProtection, actionsController.postAddSubject)

Route.get('/subjects/all',isAuth, actionsController.getAllSubject)

Route.get('/subject/edit/:subjectId', isAuth, csrfProtection, actionsController.getEditSubject)
Route.post('/subject/edit',[
    body('label').isLength({min:5}).withMessage('Label should be more than 5 characters').trim(),
    body('label').custom((label, {req}) => {
       return Subject.countDocuments({label:label, userId: req.user._id})
        .then( CountSubject => {
            if (CountSubject > 1) {
                return Promise.reject('Don\'t add more than subject with the same label')
            }
            //return true
        })
    } ),
     body('label').custom((label, {req}) => {
       return Subject.findOne({_id:req.body.subjectId, userId: req.user._id})
        .then( subject => {
            //console.log(subject)
            if (!subject) {
                return Promise.reject('Don\'t have permission to update this subject')

            }
            if (subject.userId.toString() != req.user._id.toString()) {
                return Promise.reject('Don\'t have permission to update this subject')
            }
                    subject.label = label;
            return subject.save()
        }).then(result => {
            return true
        })
    } )
    ], isAuth, csrfProtection, actionsController.postEditSubject)
Route.get('/subject/delete/:subjectId', isAuth, csrfProtection, actionsController.postDeleteSubject)

Route.get('/all/:users', isAuth, actionsController.getUsers)
Route.get('/user/delete/:userId', isAuth, csrfProtection, actionsController.postDeleteUser)

Route.get('/affected/subjects/to/teachers', isAuth, csrfProtection, actionsController.getAffectedSubjectToTeachers)
Route.get('/affected/subjects/to/teachers/:idTeacher/:idSubject', isAuth, csrfProtection, actionsController.getAffectedSubjectToTeachersPrepop)
Route.get('/get/subject/:idTeacher', isAuth, csrfProtection, actionsController.getSubject)

Route.get('/affected/students/to/teachers', isAuth, csrfProtection, actionsController.getStudentsTeachers)
Route.post('/affected/students/to/teachers', isAuth, csrfProtection, actionsController.postStudentsTeachers)


Route.get('/select/sons', isAuth, csrfProtection, actionsController.getSelectSons)
Route.post('/select/sons', isAuth, csrfProtection, actionsController.postSelectSons)


Route.get('/pay/invoice', isAuth, csrfProtection, actionsController.getPayInvoice)
Route.post('/pay/invoice', isAuth, csrfProtection, actionsController.postPayInvoice)
Route.get('/download/invoice', isAuth, csrfProtection, actionsController.downLoadInvoice)

Route.get('/add/notes', isAuth, csrfProtection, actionsController.getAddNotes)
Route.post('/add/notes', isAuth, csrfProtection, actionsController.postAddNotes)

Route.get('/student/notes/:idStudent', isAuth, csrfProtection, actionsController.getSonNotes)
Route.get('/stats', isAuth, csrfProtection, actionsController.getStats)

module.exports = Route