var mongoose = require('mongoose');
require("../server/db");
var Quest = mongoose.model('Quest');
var User = mongoose.model('User');
var things = require("chai-things");
var spies = require("chai-spies");
var chai = require('chai');
var expect = chai.expect;
chai.use(things);
chai.use(spies);

describe("Quest Model", function () {
	beforeEach(function (done) {
		Quest.remove({}, done);
	});

	describe('Validations', function () {
		var quest = new Quest({title: 'Best Quest Ever', description: 'yes'});
		beforeEach(function () {
			mongoose.model('Quest').create(quest); 
		});

		it('should err if a quest is created without a unique title', function (done) {
			var otherQuest = new Quest({title: 'Best Quest Ever', description: 'no'});
			otherQuest.save(function (err) {
				expect(err).to.have.property('err');
				expect(err.err).to.contain('Best Quest Ever');
				expect(err.err).not.to.contain('no');
				done();
			});
		});

		it('should err if a paricipant tries to join a quest they already joined', function (done) {
			var user = new User({google: {name: 'Alice Kindheart', email: 'yes.com'}});
			mongoose.model('User').create(user);
			quest.addUserFromQuest(user, function(){
				quest.addUserFromQuest(user, function(err) {
					expect(err).to.have.property('err');
					done();
				});
			});
		});

	});

});


