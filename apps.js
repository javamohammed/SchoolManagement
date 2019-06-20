//Externs dependencies
const express = require('express')
const mongoose = require('mongoose');
const bodyParser = require('body-parser')
const cookieParser= require('cookie-parser')

//Locals dependencies
const publicRoutes = require('./routes/public')
const usersRoutes = require('./routes/users')


const app = express()

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-fm2ws.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`

app.use(express.static('public'))
app.set('view engine', 'ejs')

app.use(bodyParser.urlencoded({extended:false}));

// we need this because "cookie" is true in csrfProtection
app.use(cookieParser())

app.use(publicRoutes)
app.use(usersRoutes)

mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
}).then(() =>{
    console.log("Server and Mongo_DB are running in this port " + process.env.PORT + "...")
    app.listen(process.env.PORT)
}).catch( err => {
    console.log(err)
});
