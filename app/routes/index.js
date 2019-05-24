var mongoose = require('mongoose')
var bodyParser = require('body-parser')

var userSchema = require('../models/users')
var pollSchema = require('../models/polls')
var idnumberSchema = require('../models/idnumbers')

var User = mongoose.model('User', userSchema)
var Poll = mongoose.model('Poll', pollSchema)
var Idnumber = mongoose.model('Idnumber', idnumberSchema)

var urlencodedParser = bodyParser.urlencoded({extended:false})

module.exports = function(app, passport) {
	app.get('/', function(req, res){
		Poll.find({}, function(err, doc){
			if (err) console.log(err);
			if (req.isAuthenticated()) {
				var url = 'https://avatars3.githubusercontent.com/u/'+req.user.github.id+'?v=3&s=40'
				var u = '<img src="'+url+'"/>'
				res.render('list', {polls:doc, symbol: u, id: true})
			}
			else {
				var u = '<i class="fa fa-github-square"></i>'
				res.render('list', {polls:doc, symbol: u, id:false})
			}
			
		})
	})

	// Give all polls created by the user. Apply authentication later or use profile to list all polls
	app.get('/mypolls', isLoggedIn, function(req, res){
		Poll.find({githubId: req.user.github.id}, function(err, doc){
			var url = 'https://avatars3.githubusercontent.com/u/'+req.user.github.id+'?v=3&s=40'
			var u = '<img src="'+url+'"/>'
			res.render('mypolls', {polls: doc, symbol: u})
		})
	})

	app.get('/polls', function(req, res){ 
		res.redirect('/')
	})

	app.get('/polls/new', isLoggedIn, function(req, res){
		var url = 'https://avatars3.githubusercontent.com/u/'+req.user.github.id+'?v=3&s=40'
			var u = '<img src="'+url+'"/>'
		res.render('new', {symbol: u})
	})	

	// Delete
	app.get('/polls/delete/:poll', isLoggedIn, function(req, res){
		var poll = req.params.poll
		Poll.findOne({number: poll}, function(err, doc){
			if (err) console.log(err);
			res.redirect('/mypolls')
			if (req.user.github.id===doc.githubId) {
				Poll.remove({number:poll},function(err, doc) {
					if (err) console.log(err);
					console.log('/mypolls');
				})
			}
			else {
				res.redirect('/')
			}
		})
	})

	app.get('/polls/api/:poll', function(req, res){
		var poll = req.params.poll;
		Poll.findOne({number: poll}, function(err, doc){
			if (err) console.log(err);
			res.json(doc);
		})
	})

	app.get('/polls/:poll', function(req, res){
		var poll = req.params.poll
		Poll.findOne({number:poll}, function(err, doc) {
			if (err) console.log(err);

			User.findOne({github.id: doc.githubId}, function(err, gh) {
				if (req.isAuthenticated()) {
					var url = 'https://avatars3.githubusercontent.com/u/'+req.user.github.id+'?v=3&s=40'
					var u = '<img src="'+url+'"/>'
					var userName = gh.github.username
					console.log(userName)
					res.render('detail', {poll:doc, symbol: u, id: true, user: userName})
				}
				else {
					var u = '<i class="fa fa-github-square"></i>'
					var userName = gh.github.username
					console.log(userName)
					res.render('detail', {poll:doc, symbol: u, id:false, user: userName})
				}
			})			
		})
	})

	app.post('/polls/new', isLoggedIn, urlencodedParser, function(req, res){
		var newPoll = new Poll()
		
		Idnumber.findOne({idnumber: {$exists: true}}, function(err, doc){
			if (err) console.log(err);

			var num = doc['idnumber']
			var newNum = num+1
			

			Idnumber.update({idnumber: num},{idnumber:newNum},function(err, doc){
				if (err) console.log(err);
			})

			newPoll.title = req.body.title
			newPoll.number = newNum
			newPoll.githubId = req.user.github.id
			newPoll.options = req.body.options.split('\r\n')
			newPoll.votes = generateVoteArray(newPoll.options.length)
			newPoll.save(function(err, doc) {
				if (err) console.log(err);
				res.redirect('/mypolls')
			})
		})
	})

	app.post('/polls/:poll', urlencodedParser, function(req, res) {
		var poll = req.params.poll
		var choice = req.body.choice
		var customOption = req.body.customOption
		// Find index of the chosen value
		Poll.findOne({number:poll}, function(err, doc){
			if (err) console.log(err);
			var options = doc.options
			var votes = doc.votes

			if (customOption==='') {
				var position = options.indexOf(choice)
				votes[position] += 1
			}

			else {
				options.push(customOption)
				votes.push(1)
			}

			// A highly inefficient version
			// Try to write a better one

			Poll.update({number: poll}, {$set: {votes: votes, options: options}}, function(err, doc){
				if (err) console.log(err);
				res.redirect('/polls/'+poll)
			})
		})

	})

	// Create routes for update 
	// Create routes for delete

	// CRUD
	// Create - /polls/new - authenticated
	// Read - /polls/:poll - anyone
	// Update - /polls/edit/:poll - authorized(new middleware id match)
	// Delete - /polls/delete/:poll - authorized(")

	app.get('/login',isLoggedInProfile, function(req, res) {
		res.redirect('/auth/github')
	})

	app.get('/logout',isLoggedIn, function(req, res) {
		req.logout()
		res.redirect('/')
	})

	app.get('/profile', isLoggedIn, function(req, res){
		res.render('profile', {user: req.user})
	})

	app.get('/auth/github', passport.authenticate('github'))

	app.get('/auth/github/callback', passport.authenticate('github', {
		successRedirect: '/',
		failureRedirect: '/login'
	}))

	app.use(function(req, res, next) {
		if (req.accepts('html')) {
			res.render('404', { url: req.url });
		}
	})
}

// Custom middleware, if user clicks on /profile while logged out redirect to /
function isLoggedIn(req, res, next) {
	if (req.isAuthenticated())
		return next()
	res.redirect('/')
}

// Custom middleware, if user clicks on /login while already logged in redirect to /profile
function isLoggedInProfile (req, res, next) {
	if (!req.isAuthenticated())
		return next()
	res.redirect('/profile')
}

function generateVoteArray(len) {
	var arr=[];
	for (var i=0;i<len;i++)
		arr.push(0)
	return arr;
}