'use strict';
var mongoose = require('mongoose');
var User = require('./user.js');

var schema = new mongoose.Schema({
   user: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
   responses:[{
		qName:String,
		response:String
   }]
});

mongoose.model('Responses', schema);