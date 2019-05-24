var mongoose = require('mongoose')

var idnumberSchema = new mongoose.Schema({
	idnumber: Number
})

module.exports = idnumberSchema