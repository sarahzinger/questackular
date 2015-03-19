'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
   user: {type: Schema.Types.ObjectId, ref: 'User'},
   responses:[{
		qName:String,
		response:String
   }]
});

mongoose.model('Responses', schema);