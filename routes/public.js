const express = require('express')

const publicController = require('../controllers/public')
const isAuth = require('../middleware/is-auth')

const Route = express.Router()

Route.get('/'/*, isAuth*/, publicController.getHome)
Route.get('/404', publicController.get404)
module.exports = Route;