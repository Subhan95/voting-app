var mongoose = require('mongoose')
var GitHubStrategy = require('passport-github').Strategy
var configAuth = require('./auth')
var userSchema = require('../models/users')
var User = mongoose.model('User', userSchema)

module.exports = function(passport) {
	passport.serializeUser(function(user, done){
		done(null, user.id)
	})

	passport.deserializeUser(function(id, done){
		User.findById(id, function(err, user){
			done(err, user)
		})
	})

	passport.use(new GitHubStrategy({
		clientID: configAuth.githubAuth.clientID,
		clientSecret: configAuth.githubAuth.clientSecret,
		callbackUrl: configAuth.githubAuth.callbackUrl,
	},
	function(token, refreshToken, profile, done) {
		process.nextTick(function(){
			User.findOne({'github.id':profile.id}, function(err, user){
				if (err) return done(err)

				if (user) return done(null, user)

				else {
					var newUser = new User()
					newUser.github.id = profile.id
					newUser.github.username = profile.username
					newUser.github.displayName = profile.displayName
					newUser.github.publicRepos = profile._json.public_repos

					newUser.save(function(err) {
						if (err) console.log(err);
						return done(null, newUser)
					})
				}
			})
		})
	}
	))
}