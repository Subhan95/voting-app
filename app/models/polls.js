var mongoose = require('mongoose')

var pollSchema = new mongoose.Schema({
	title: String,
	number: Number,
	githubId: String,
	options: [{type: String}],
	votes: [{type:Number, default:0}]
})

module.exports = pollSchema