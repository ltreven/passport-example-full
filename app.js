require('dotenv').config()

const bodyParser   = require('body-parser')
const cookieParser = require('cookie-parser')
const express      = require('express')
const passport      = require('passport')

// Set up the database
require('./configs/db');

// Create server
const app = express()

// Middleware Setup
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))
app.use(cookieParser())

// Configurar Session
const session = require('./configs/session')
session(app)

// Debes configurar passport antes de passport.initialize():
require('./configs/passport')

app.use(passport.initialize())
app.use(passport.session())

const router = require('./routes/auth-routes')
app.use('/', router)

module.exports = app
