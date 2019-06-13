const express = require('express')

const publicController = require('../controllers/public')

const Route = express.Router()

Route.get('/', publicController.getHome)

module.exports = Route;