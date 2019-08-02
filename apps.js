//Externs dependencies
const path = require('path');
const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cookieParser= require('cookie-parser')
const session = require('express-session')
const multer = require('multer')
const uniqid = require('uniqid')


//Locals dependencies
const publicRoutes = require('./routes/public')
const usersRoutes = require('./routes/users')
const UserSchoolRoutes = require('./routes/UserSchool')
const ActionsSchoolRoutes = require('./routes/action')
const publicController = require('./controllers/public')
const User = require('./models/user')
const UserSchool = require('./models/UserSchool')

const app = express()

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-fm2ws.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`

//app.use(express.static('public'))
app.use(express.static(path.join(__dirname, 'public')))
app.use("/uploads", express.static(path.join(__dirname, 'uploads')))

app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended:false}));

app.use(
  session({
    secret: 'test tst',
    resave: false,
    saveUninitialized: false
    /*store: store*/
  })
);

/*
app.use((req, res, next) => {
    req.session.isLoggedIn =  true
    req.session.type_user = 'school'
    User.findOne({ email:'razi@gmail.com'})
        .then(user => {
            req.session.user = user
            req.type_user_school = 'not'
            req.user = user
            next()
        })
        .catch(err => console.log(err))
})

*/
app.use((req, res, next) => {
    if (!req.session.user && req.session.type_user != 'school') {
         return next()
    }
    User.findById({_id:req.session.user._id})
        .then(user => {
            if (!user) {
                return next()
            }
            req.type_user_school = 'not'
            req.user = user
            next()
        })
        .catch(err => console.log(err))

})

app.use((req, res, next) => {
     if (!req.session.user && req.session.type_user != 'not_school') {
         return next()
     }
     UserSchool.findById({_id:req.session.user._id})
         .then(userSchool => {
             if (!userSchool) {
                 return next()
             }
             req.type_user_school = user.type_user_school
             req.user = userSchool
             next()
         })
         .catch(err => console.log(err))
})



// we need this because "cookie" is true in csrfProtection
app.use(cookieParser())

// SET STORAGE
const storageFiles = multer.diskStorage({
    destination: function(req, file, cb){
        if (req.session.type_user == 'not_school') {
            cb(null, 'uploads/avatar')
        }else{
            cb(null,'uploads/types_docs')
        }
    },
    filename: function(req, file, cb){
         if (req.session.type_user == 'not_school') {
            cb(null, uniqid('avatar-') + file.originalname)
         } else {
            cb(null, uniqid('type_doc-') + file.originalname)
         }
    }
})
const fileFilter = (req, file, cb) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg' ){
        cb(null, true)
    }else{
        cb(null, false)
    }
}
app.use(multer({storage:storageFiles, fileFilter:fileFilter}).single('image_doc'))

app.use(publicRoutes)
app.use(usersRoutes)
app.use(UserSchoolRoutes)
app.use(ActionsSchoolRoutes)

//app.get('/*', publicController.get404)
mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
}).then(() =>{
    console.log("Server and Mongo_DB are running in this port " + process.env.PORT + "...")
    app.listen(process.env.PORT)
}).catch( err => {
    console.log(err)
});
