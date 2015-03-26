'use strict';
var async =  require('async'),
	mongoose = require('mongoose');

require("./");
var Quest = mongoose.model('Quest');
var Step = mongoose.model('Step');
var User = mongoose.model('User');

var bluebird = require('bluebird');
var mongoose = require('mongoose');

var quests = [
	{title: 'Quest Ions'},
	{title: 'Best Quest'},
	{title: 'Quest of the West'},
	{title: 'Quick Quest'}
];

var steps = [
	{url: google.com,
	 
	}

];

var seed = function (name, description, price, category, imageUrl) {
	var parentCategory;
	var foundCategory = Category.findOne({name:category}).exec();
	// console.log(foundCategory);
	Category.findOne({name:category}).exec(function (err, category) {
		if (err) next(err);
		// console.log(category);
	})
	.then(function(category) {
		parentCategory=category;
		// console.log(parentCategory);
		return Vacation.create({
			name: name,
			description: description,
			price: price,
			category: parentCategory._id,
			imageUrl: imageUrl
		});
	});
};

vacations.forEach(function (vacation) {
	var name = vacation.name,
		description = vacation.description,
		price = vacation.price,
		category = vacation.category,
		imageUrl = vacation.imageUrl;

		seed(name, description, price, category, imageUrl);
});

