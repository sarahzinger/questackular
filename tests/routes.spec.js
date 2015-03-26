var mongoose = require('mongoose');
require("../server/db");
var supertest = require('supertest');
var app = require('../server/app');
var agent = supertest.agent(app);
var spies = require("chai-spies");
var chai = require('chai');
var expect = chai.expect;
var User = mongoose.model('User');
var Quest = mongoose.model('Quest');
var Step = mongoose.model('Step');



chai.use(spies);

describe('Server', function () {

	beforeEach(function (done) {
		Quest.remove({}, done);
	});

	describe('GET /', function () {
		it('should get 200 on index', function (done) {
			agent
				.get('/')
				.expect(200, done);
		});
	});

	describe('POST /quests', function () {
		it('should create a new quest', function (done) {
			agent
				.post('/api/quests')
				.send({title: 'Title of a Quest', description: 'Description of a Quest'})
				.end(function (err, response) {
					Quest.findOne({title: 'Title of a Quest'}, function (err, returnedQuest) {
						console.log('returnedQuest', returnedQuest);
						expect(returnedQuest).to.exist;
						expect(returnedQuest.title).to.equal('Title of a Quest');
						done();
					});
				});
		});
	});
	
	describe('GET /quests', function () {
		it('should get 200', function (done) {
			agent
				.get('/api/quests')
				.expect(200, done);
		});
	});

	describe('GET /quests/user/:id', function () {
		it('should get 200', function (done) {
			agent
				.get('/api/quests/user/:id')
				.expect(200, done);
		});
	});

	describe('GET /quests/:id', function () {
		it('should get 200', function (done) {
			agent
				.get('/api/quests/:id')
				.expect(200, done);
		});
	});

	describe('POST /step', function () {
		it('should create a new step', function (done) {
			agent
				.post('/api/step')
				.send({url: "google.com", pointValue: 10, question: "What's a question?", qType: 'fillIn'})
				.end(function (err, response) {
					Step.findOne({question: "What's a question?"}, function (err, returnedStep) {
						expect(returnedStep).to.exist;
						expect(returnedStep.question).to.equal("What's a question?");
						done();
					});
			});
		});
	});

	describe('GET /step/list/:id', function () {
		it('should get 200', function (done) {
			agent
				.get('/api/step/list/:id')
				.expect(200, done);
		});
	});

});