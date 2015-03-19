'use strict';
var mongoose = require('mongoose');

var schema = new mongoose.Schema({
   owner: { type: Schema.Types.ObjectId, ref: 'User' },
   privacy: {type: Boolean},
   open: {type: Boolean},
   participants: [{type: Schema.Types.ObjectId, ref: 'User'}],
   steps:[{type: Schema.Types.ObjectId, ref: 'Step'}],
   title:String
   description:String
});

mongoose.model('Quest', schema);