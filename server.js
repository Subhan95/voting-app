var express = require('express')
var path = require('path')
var session = require('express-session')
var passport = require('passport')
var mongoose = require('mongoose')
var cookieParser = require('cookie-parser')

var routes = require('./app/routes/index')

var app = express()

// Require dotenv and apply config to use env variables
require('dotenv').config()

mongoose.connect(process.env.MONGO_URI)
mongoose.Promise = global.Promise

require('./app/config/passport')(passport)

// Set middleware
app.use(express.static('./static'))
app.use(cookieParser())
app.use(session({
	secret: 'poll-app',
	saveUninitialized: true,
	resave: true
}))

app.use(passport.initialize())
app.use(passport.session())

// Set view engine
app.set('view engine', 'ejs')
// Set location of views
app.set('views', path.join(__dirname, 'app/views'))

routes(app, passport)

// Port to listen to
// Change to process.env.PORT while deploying to heroku
app.listen(process.env.PORT||3000)
console.log('Server running on port 3000');