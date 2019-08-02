const {validationResult} = require('express-validator/check')
const stripe = require("stripe")(process.env.keySecret);
const PDFDocument = require('pdfkit');
const path = require('path')
const fs = require('fs')
const Subject = require('../models/subject')
const UserSchool = require('../models/UserSchool')
const Affected = require('../models/Affected')
const Son = require('../models/Son')

const ITEMS_PER_PAGE = 2
exports.getMenu = (req, res, next) => {
    let type_user_school ='';
    if (req.type_user_school) {
        type_user_school = req.type_user_school
    }
    console.log('type_user_school =>', type_user_school)
    return res.render('actions/index',{
        isAuth: req.session.isLoggedIn,
        type_user: req.session.type_user,
        type_user_school: type_user_school,
        user_id : req.user._id
    })
}

exports.getAddSubject = (req, res, next) => {
    if (req.session.type_user == 'school') {
        return res.render('actions/add_subject', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            label:'',
            csrfToken: req.csrfToken()
        })
    }
    return res.redirect('/')
}
exports.postAddSubject = (req, res, next) => {
    if (req.session.type_user == 'school' && req.session.isLoggedIn == true) {
        const errors = validationResult(req)
        const label = req.body.label
        const token = req.body._csrf
        if (!errors.isEmpty()) {
             let labelError = ''
            errors.array().forEach(function (obj) {
                if (obj.param == 'label') {
                    labelError = obj.msg
                }
            })
            console.log(errors.array())
            return res.render('actions/add_subject', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                label: label,
                labelError: labelError,
                csrfToken: token
            })

        }
        const subject =new Subject({label:label, userId:req.user._id})
        return subject.save().then( result =>{
            console.log('subject is created ...')
            return res.redirect('/subjects/all')
        } ).catch( err=> console.log(err))
    }
    return res.redirect('/')
}

exports.getAllSubject = (req, res, next) => {
    const page = +req.query.page || 1
    let totalItems;
    if (req.session.type_user == 'school') {
        return Subject.countDocuments({userId: req.user._id}).then(numberSubjects => {
            totalItems = numberSubjects
            return Subject.find({userId: req.user._id}).skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
        }).then( subjects => {
            //console.log('LastPage : ', Math.floor(totalItems / ITEMS_PER_PAGE), totalItems, ITEMS_PER_PAGE)
             return res.render('actions/all_subjects', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                subjects: subjects,
                currentPage: page,
                hasNextPage: ITEMS_PER_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.floor(totalItems / ITEMS_PER_PAGE)
             })
        })


        /*
        return Subject.find().exec()
        .then(subjects => {
            //console.log(subjects)
            return res.render('actions/all_subjects', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                subjects: subjects,
            })
        })
        .catch(err => console.log(err))
        */
    }
    return res.redirect('/')
}
exports.getEditSubject = (req, res, next) => {
    //console.log(req.params.subjectId)
    let subjectId = req.params.subjectId;
    if(subjectId == null){
        subjectId = req.body.subjectId
    }
    if (req.session.type_user == 'school') {
        return Subject.findOne({_id: subjectId, userId: req.user._id})
            .then(subject => {
                if(!subject){
                    return res.redirect('/subjects/all')
                }
                 return res.render('actions/edit_subject', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            label: subject.label,
            subjectId: subjectId,
            csrfToken: req.csrfToken()
        })
            })
            .catch( err => console.log(err))
    }
    return res.redirect('/')
}
exports.postEditSubject = (req, res, next) => {
    if (req.session.type_user == 'school' && req.session.isLoggedIn == true) {
        const errors = validationResult(req)
        const label = req.body.label
        const subjectId = req.body.subjectId
        const token = req.body._csrf
        if (!errors.isEmpty()) {
             let labelError = ''
            errors.array().forEach(function (obj) {
                if (obj.param == 'label') {
                    labelError = obj.msg
                }
            })
            console.log(errors.array())
            return res.render('actions/edit_subject', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                label: label,
                subjectId: subjectId,
                labelError: labelError,
                csrfToken: token
            })

        }
            console.log('subject is updated ...')
            return res.redirect('/subjects/all')

    }
    return res.redirect('/')
}

exports.postDeleteSubject = (req, res, next) => {
    //console.log(req.params.subjectId)
    if (req.session.type_user == 'school') {
        return Subject.findOne({_id:req.params.subjectId, userId:req.user._id})
            .then( subject => {
                if(!subject){
                    return res.redirect('/subjects/all')
                }
                return Subject.deleteOne({_id:req.params.subjectId}).exec()
            })
            .then( result => {
                console.log('subject is deleted...')
                  return res.redirect('/subjects/all')
            }).catch( err => console.log(err))
    }
    return res.redirect('/')
}

exports.getUsers = (req, res, next) => {
    const type_users = req.params.users
    const ITEMS_PER_USERS_PAGE = 3
    const page = +req.query.page || 1
    let totalItems;
    let t_users = ['teachers', 'parents', 'students']
    if (!t_users.includes(type_users)) {
        return res.redirect('/actions')
    }
    if (req.session.type_user == 'school') {
        let type_user_school = 'Student'
        if (type_users == 'teachers') {
            type_user_school = 'Teacher'
        }
        if (type_users == 'parents') {
            type_user_school = 'Parent'
        }
        return UserSchool.countDocuments({
            id_school: req.user._id,
            type_user_school:type_user_school
        }).then(numberItems => {
            totalItems = numberItems
            return UserSchool.find({
                id_school: req.user._id,
                type_user_school: type_user_school
            }).skip((page - 1) * ITEMS_PER_USERS_PAGE).limit(ITEMS_PER_USERS_PAGE)
        }).then(users => {
            //console.log('LastPage : ', Math.floor(totalItems / ITEMS_PER_USERS_PAGE), totalItems, ITEMS_PER_USERS_PAGE)
            return res.render('actions/all_users', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                users: users,
                type_users: type_users,
                currentPage: page,
                hasNextPage: ITEMS_PER_USERS_PAGE * page < totalItems,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.floor(totalItems / ITEMS_PER_USERS_PAGE)
            })
        })
    }
    return res.redirect('/')
}

exports.postDeleteUser = (req, res, next) => {
    console.log(req.params.userId)
    let type_user_school = 'Student'
    if (req.session.type_user == 'school') {
        return UserSchool.findOne({_id:req.params.userId, id_school:req.user._id})
            .then( userSchool => {

                if (!userSchool) {
                    return res.redirect('/all/all')
                }
                type_user_school = userSchool.type_user_school
                return UserSchool.deleteOne({_id:req.params.userId}).exec()
            })
            .then( result => {
                console.log('userSchool is deleted...')
                let users = 'students'
                if (type_user_school == 'Teacher') {
                    users = 'teachers'
                }
                if (type_user_school == 'Parent') {
                    users = 'parents'
                }
                  return res.redirect('/all/' + users)
            }).catch( err => console.log(err))
    }
    return res.redirect('/')
}

exports.getAffectedSubjectToTeachers = (req, res, next) => {
    if (req.session.type_user == 'school') {
       const type_users = req.params.users
       const ITEMS_PER_USERS_PAGE = 3
       const page = +req.query.page || 1
       let totalItems;
       let subjects;
       return Subject.find({userId: req.user._id}).exec()
            .then( subjectsResult => {
                subjects = subjectsResult
                return UserSchool.countDocuments({
                    id_school: req.user._id,
                    type_user_school: 'Teacher'
                })
            }).then(numberItems => {
               totalItems = numberItems
               return UserSchool.find({
                   id_school: req.user._id,
                   type_user_school: 'Teacher'
               }).skip((page - 1) * ITEMS_PER_USERS_PAGE).limit(ITEMS_PER_USERS_PAGE)
           }).then(teachers => {
                return res.render('actions/affected_subject_to_teachers', {
                   isAuth: req.session.isLoggedIn,
                   type_user: req.session.type_user,
                   teachers: teachers,
                   subjects: subjects,
                   type_users: type_users,
                   currentPage: page,
                   hasNextPage: ITEMS_PER_USERS_PAGE * page < totalItems,
                   hasPreviousPage: page > 1,
                   nextPage: page + 1,
                   previousPage: page - 1,
                   lastPage: Math.floor(totalItems / ITEMS_PER_USERS_PAGE)
               })
           })

    }
    return res.redirect('/')
}

exports.getAffectedSubjectToTeachersPrepop = (req, res, next) => {

    const idSubject = req.params.idSubject
    const idTeacher = req.params.idTeacher
    let label ;
    let teachers = []
 if (req.session.type_user == 'school') {
    return Subject.find().exec()
            .then(subjects => {
              return  subjects.map( subject => {
                    let arrayTeachers = subject.teachers
                    let exist = arrayTeachers.find(function (teacher) {
                        return teacher.teacherId.toString() == idTeacher;
                    });
                    if(exist != undefined){
                        return true;
                    }
                })
            }).then( exists => {
                 let found = exists.find(function (exist) {
                     return exist == true;
                 });
                 console.log("found =>", found)
                 if(found == true){
                    res.setHeader('content-type', 'application/json')
                    return res.send(JSON.stringify({ errors: "this subject is incorrect!", success: "",label: "" }, null, 3))
                 }
                 return Subject.findOne({_id: idSubject, userId: req.user._id})

            }).then( subject => {
            if (!subject){
                return res.send(JSON.stringify({ errors: "this subject is incorrect!", success: "",label: "" }, null, 3))
            }
            teachers = subject.teachers
            teachers.push({teacherId: idTeacher})
            subject.teachers = teachers
            label = subject.label
            return  subject.save()
            })
            .then( result => {
                return res.send(JSON.stringify({  errors: "", success: "its ok", label: label }, null, 3))
            })
                .catch(err => console.log(err))

/*
    return Subject.findOne({_id: idSubject, userId: req.user._id}).exec()
        .then( subject => {
            if (!subject){
                return res.send(JSON.stringify({ errors: "this subject is incorrect!", success: "",label: "" }, null, 3))
            }
            teachers = subject.teachers
            let found = teachers.find(function (teacher) {
                return teacher.teacherId == idTeacher;
            });
            if(found != undefined){
                teachers.push({teacherId: idTeacher})
            }
        subject.teachers = teachers
        label = subject.label
        return  subject.save()
        })
        .then( result => {
            return res.send(JSON.stringify({  errors: "", success: "its ok", label: label }, null, 3))
        })
        .catch( err => console.log(err))*/
    }
    return res.send(JSON.stringify({ errors: "this subject is incorrect!", success: "",label: "" }, null, 3))
}

exports.getSubject = (req, res, next )=> {
    const idTeacher = req.params.idTeacher
      return Subject.find({userId: req.user._id}).exec()
        .then( subjects => {
            if (!subjects) {
                return res.send(JSON.stringify({ errors: "this subject is incorrect!", success: "",label: "" }, null, 3))
            }
            let label;
            subjects.map( subject => {
                let teachers = subject.teachers
                //console.log(subject.teachers)
                let found = teachers.find(function (teacher) {
                   // console.log(teacher.teacherId.toString() +'=='+ idTeacher)
                    return teacher.teacherId.toString() == idTeacher;
                });
                if(found != undefined && label == undefined){
                        label = subject.label
                 }

            })
        return res.send(JSON.stringify({  errors: "", success: "its ok", label: label }, null, 3))
        })
        .catch( err => console.log(err))
}

exports.getStudentsTeachers = (req, res, next) => {
    let users;
    return UserSchool.find({id_school: req.user._id})
            .then(usersResult => {
                users = usersResult
           return Affected.find({idSchool : req.user._id})
    })
    .then( affected_rows =>{
         return res.render('actions/affected_students_to_teachers', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            users: users,
            affected_rows: affected_rows,
            csrfToken: req.csrfToken()
         })
    })
    .catch(err => console.log(err))
}

exports.postStudentsTeachers =  async (req, res, next) => {
    //console.log(req.body)
    if(!req.body.students || !req.body.teachers){
        const users = await UserSchool.find({id_school: req.user._id})
        const affected_rows =  await  Affected.find({idSchool: req.user._id})
        return res.render('actions/affected_students_to_teachers', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            users: users,
            affected_rows: affected_rows,
            csrfToken: req.csrfToken(),
            error: "Please select students and teachers"
        })

    }
    let students = []
    let teachers = []
    const subjects = await Subject.find({userId: req.user._id})
    subjects.map( subject => {
        if (subject.teachers.length > 0 ) {
            subject.teachers.map( tech => {
                teachers.push({teacherId: tech.teacherId.toString(), label: subject.label})
            })
        }
    })
    let reqBodyTeachers = []
    if (Array.isArray(req.body.teachers)){
        reqBodyTeachers = [...req.body.teachers]
    }else{
        reqBodyTeachers.push(req.body.teachers)
    }
    let reqBodyStudents = []
    if (Array.isArray(req.body.students)) {
        reqBodyStudents = [...req.body.students]
    } else {
        reqBodyStudents.push(req.body.students)
    }
    let usersTeachers = []
    let usersStudents = []
    const usersResult = await UserSchool.find({id_school: req.user._id, _id: {$in: reqBodyStudents.concat(reqBodyTeachers)}})
    usersResult.map( user => {
        if (user.type_user_school === 'Student'){
            usersStudents.push({ id: user._id.toString(), name: user.first_name + ' ' + user.last_name })
        }else{
            usersTeachers.push({ id: user._id.toString(), name: user.first_name + ' ' + user.last_name })
        }
    })
    let  subjectsTeachers = []
    usersTeachers.map( tt => {
        subjectsTeachers.push({id:tt.id, label : teachers.find(ll => ll.teacherId == tt.id).label, name: tt.name})
    })
    //console.log(subjectsTeachers)
    usersStudents.map( etu => {
        subjectsTeachers.map( async (tech) =>  {
            let affected = new Affected({
            idSchool: req.user._id,
            idTeacher: tech.id,
            idStudent: etu.id,
            teacher_name: tech.name,
            student_name: etu.name,
            subject_label:tech.label,
            note:0
        })

        await affected.save()
        })
    })
    const users = await UserSchool.find({id_school: req.user._id})
        const affected_rows =  await  Affected.find({idSchool: req.user._id})
        return res.render('actions/affected_students_to_teachers', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            users: users,
            affected_rows: affected_rows,
            csrfToken: req.csrfToken(),
            success: "students affected with success !!"
        })

}

exports.getSelectSons = async (req, res, next) => {
    const sonsAlready = await Son.find({idSchool : req.user.id_school}).exec()
    const conditionArray = []
    sonsAlready.map( son => {
            conditionArray.push(son.idStudent)
    })
    //console.log(conditionArray)
    const students = await UserSchool.find({id_school: req.user.id_school, type_user_school: 'Student', _id: {$not:{$in: conditionArray}} }).exec()
    const sons = await Son.find({idSchool : req.user.id_school, idParent: req.user._id}).exec()
     return res.render('actions/select_sons', {
         isAuth: req.session.isLoggedIn,
         type_user: req.session.type_user,
         students: students,
         sons: sons,
         csrfToken: req.csrfToken()
     })
}

exports.postSelectSons = async (req, res, next) => {
    if(!req.body.students){
        const sonsAlready = await Son.find({idSchool : req.user.id_school}).exec()
        const conditionArray = []
        sonsAlready.map( son => {
                conditionArray.push(son.idStudent)
        })
        const students = await UserSchool.find({id_school: req.user.id_school, type_user_school: 'Student', _id: {$not:{$in: conditionArray}}}).exec()
        const sons = await Son.find({idSchool : req.user.id_school, idParent: req.user._id}).exec()
        return res.render('actions/select_sons', {
            isAuth: req.session.isLoggedIn,
            type_user: req.session.type_user,
            students: students,
            sons: sons,
            csrfToken: req.csrfToken(),
            error: "Please select your sons"
        })
    }
     let reqBodyStudents = []
     if (Array.isArray(req.body.students)) {
         reqBodyStudents = [...req.body.students]
     } else {
         reqBodyStudents.push(req.body.students)
     }
    //console.log(reqBodyStudents)
    const students = await UserSchool.find({id_school: req.user.id_school,type_user_school: 'Student', _id: {$in: reqBodyStudents} })
     students.map(  async (student) => {
         let son = new Son({
             idSchool:req.user.id_school,
             idParent: req.user._id,
             idStudent:student._id.toString(),
             parent_name: req.user.first_name + ' ' + req.user.last_name,
             student_name: student.first_name + ' ' + student.last_name,
             amount:100,
             payed:false,
         })
         await son.save()
     })
     const sonsAlready = await Son.find({idSchool : req.user.id_school}).exec()
    const conditionArray = []
    sonsAlready.map( son => {
            conditionArray.push(son.idStudent)
    })
    const Students = await UserSchool.find({id_school: req.user.id_school, type_user_school: 'Student', _id: {$not:{$in: conditionArray}}}).exec()
    const sons = await Son.find({idSchool : req.user.id_school, idParent: req.user._id}).exec()
     return res.render('actions/select_sons', {
        isAuth: req.session.isLoggedIn,
        type_user: req.session.type_user,
        students: Students,
        sons: sons,
        csrfToken: req.csrfToken(),
        success: "sons affected with success !!"
    })
}

exports.getPayInvoice = async (req, res, next) => {
    if (req.type_user_school == 'Parent') {
        const sons = await Son.find({idParent: req.user._id,idSchool : req.user.id_school, payed: false}).exec()
        return res.render('actions/invoice', {
         isAuth: req.session.isLoggedIn,
         type_user: req.session.type_user,
         sons: sons,
         csrfToken: req.csrfToken()
     })
    }
    return res.redirect('/actions')
}

exports.postPayInvoice = async (req, res, next) => {
   let reqBodySons = []
   if (Array.isArray(req.body.sons)) {
       reqBodySons = [...req.body.sons]
   } else {
       reqBodySons.push(req.body.sons)
   }
   const sonsCount = await Son.countDocuments({_id: { $in: reqBodySons }}).exec()
   console.log('sonsCount => ', sonsCount)
   let amount = sonsCount * 10000; // 5 * 100 => 500 cents means $5 
   // create a customer
   const customer = await stripe.customers.create({
           email: req.user.email, // customer email, which user need to enter while making payment
           source: 'tok_visa', // token for the given card
       })
       await stripe.charges.create({ // charge the customer
               amount,
               description: "Sample Charge",
               currency: "usd",
               customer: customer.id
           })
    const sons = await Son.find({_id: { $in: reqBodySons }})
    sons.map( async (son) => {
        son.payed = true
        await son.save()
        console.log('is Paid ...')
        })
     const sonsResult = await Son.find({idParent: req.user._id,idSchool : req.user.id_school, payed: false}).exec()
        return res.render('actions/invoice', {
         isAuth: req.session.isLoggedIn,
         type_user: req.session.type_user,
         sons: sonsResult,
         csrfToken: req.csrfToken(),
         success: 'Paid success !!'
        })
}

exports.downLoadInvoice =  async (req, res, next) => {
    // Create a document

    const doc = new PDFDocument;
     const invoiceName = 'invoice-' + req.user._id + '.pdf'
     const invoicePath = path.join('uploads', 'invoices', invoiceName)
    res.setHeader('Content-type', 'application/pdf')
    res.setHeader('Content-Disposition', 'attachment; filename="' + invoiceName + '"')
    doc.pipe(fs.createWriteStream(invoicePath));
    doc.pipe(res)
    doc.fontSize(26).text('Invoice', {
        underline: true
    });
    doc.text('---------------------------------')
    const sons = await Son.find({idParent: req.user._id,idSchool : req.user.id_school, payed: true}).exec()
    let total = 0;
    doc.text('Name Parent : ' + req.user.first_name + ' '+ req.user.last_name)
    doc.text('---');
    sons.map( son => {
        doc.text('Name Son : ' + son.student_name)
        doc.text('Amount : ' + son.amount)
        doc.text('---');
        total = total + 100
    })
    doc.fontSize(20).text('Total : '+total+'$');
    doc.end()

}

exports.getAddNotes = async (req, res, next) => {
     if (req.type_user_school == 'Teacher') {
        const students = await Affected.find({idSchool: req.user.id_school, idTeacher: req.user._id}).exec()
        //console.log(students)
        return res.render('actions/add_notes', {
         isAuth: req.session.isLoggedIn,
         type_user: req.session.type_user,
         students: students,
         csrfToken: req.csrfToken()
     })
    }
    return res.redirect('/actions')
}

exports.postAddNotes = async (req, res, next) => {
     if (req.type_user_school == 'Teacher') {
        const StudentsNotes = Object.entries(req.body)
        for (let [id, note] of StudentsNotes) {
            if (id != '_csrf') {
                let student = await Affected.findOne({_id:id.toString().trim()})
                //console.log(student)
                student.note = note
                await student.save()
            }
        }
        const students = await Affected.find({idSchool: req.user.id_school, idTeacher: req.user._id}).exec()
        return res.render('actions/add_notes', {
         isAuth: req.session.isLoggedIn,
         type_user: req.session.type_user,
         students: students,
         success: 'new notes are added !!',
         csrfToken: req.csrfToken()
     })
    }
    return res.redirect('/actions')
}

exports.getSonNotes = (req, res, next) => {
    if (req.type_user_school == 'Student' || req.type_user_school == 'Parent') {
    const idStudent = req.params.idStudent
    console.log('idStudent =>',idStudent)
    return Affected.find({idStudent: idStudent, idSchool: req.user.id_school}).exec()
        .then( students => {
            const studentArray = []
            let student_name = ''
            let total = 0
            let cpt= 0
            students.map( student => {
                student_name = student.student_name
                 studentArray.push({
                     subject_label: student.subject_label,
                     note: student.note,
                     teacher_name: student.teacher_name
                 })
                 cpt ++
                 total = total + student.note
            })
            return res.render('actions/result_student', {
                isAuth: req.session.isLoggedIn,
                type_user: req.session.type_user,
                students: studentArray,
                csrfToken: req.csrfToken(),
                student_name: student_name,
                total : (total/cpt).toFixed(2)
            })
    }).catch( err => console.log(err))
}
return res.redirect('/actions')
}

exports.getStats = (req, res, next) => {
    if (req.session.type_user == 'school') {
        return Subject.find().exec()
            .then( subjects => {
                const SubjectArray = []
                subjects.map( subject => {
                    SubjectArray.push(subject.label)
                })
                console.log(SubjectArray)
                return res.render('actions/stats', {
                    isAuth: req.session.isLoggedIn,
                    type_user: req.session.type_user,
                    data: [0, 10, 5, 2, 20, 30, 45],
                    labels: SubjectArray
                })
            }).catch(err => console.log(err))
    }

    return res.redirect('/actions')
}