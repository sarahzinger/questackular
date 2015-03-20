var router = require('express').Router();
var Quest = require('../../db/models/quest.js');



router.get('/quests', function(req, res) {
	Quest.find({}).exec(function(err,quests) {
		if(err) res.send(err);
		res.json(quests);
	});
});


module.exports = router;

