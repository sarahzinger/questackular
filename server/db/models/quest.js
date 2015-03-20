'use strict';
var mongoose = require('mongoose');
var User = require('./user.js');
var Step = require('./steps.js');

var schema = new mongoose.Schema({
   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
   privacy: {type: Boolean},
   open: {type: Boolean},
   participants: [{type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
   steps:[{type: mongoose.Schema.Types.ObjectId, ref: 'Step'}],
   title:String,
   description:String
});

mongoose.model('Quest', schema);