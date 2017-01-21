var mongoose = require('mongoose')

var userSchema = new mongoose.Schema({
	github: {
		id: String,
		displayName: String,
		username: String,
		publicRepos: Number,
	}
})

module.exports = userSchema