var router = require('express').Router();
var Quest = require('../../db/models/quest.js');
var User = require('../../db/models/user.js');


router.get('/', function(req, res) {
	Quest.find({}).exec(function(err,quests) {
		if(err) res.send(err);
		res.json(quests);
	});
});
router.get('/:id', function(req, res) {
	var questId = req.params.id;
	Quest.find({_id: questId}).exec(function(err,quest) {
		if(err) res.send(err);
		res.json(quest);
	});
});
module.exports = router;

