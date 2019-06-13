//Externs dependencies
const express = require('express')
const mongoose = require('mongoose');

//Locals dependencies
const publicRoutes = require('./routes/public')

const app = express()

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0-fm2ws.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`

app.use(express.static('public'))
app.set('view engine', 'ejs')


app.use(publicRoutes)


mongoose.connect(MONGODB_URI, {
    useNewUrlParser: true
}).then(() =>{
    console.log("Server and Mongo_DB are running in this port " + process.env.PORT + "...")
    app.listen(process.env.PORT)
}).catch( err => {
    console.log(err)
});
