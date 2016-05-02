var express = require('express');
var router = express.Router();
var User = require('./user');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var champions = require('./champions');

var createUser = function(session) {
  var user = new User();
  user.save();
  session.user = user.id;
  return user;
}
router.get('/user', function(req, res, next) {
  if (!req.session.user) {
    return res.send({});
  }
  User.findById(req.session.user).exec(function(err, user) {
    if (err || !user) {
      req.session.user = null;
      return res.send({});
    }
    var levels = {};
    for (var i in user.manual) {
      var champ = user.manual[i].champion;
      levels[champ] = user.manual[i].level;
    }
    for (var i in user.account) {
      var champ = user.account[i].champion;
      if (!levels.hasOwnProperty(champ) || user.account[i].level > levels[champ]) {
        levels[champ] = user.account[i].level;
      }
    }
    res.send(levels);
  });
});

router.post('/save', function(req, res, next) {
  var champion = req.body.champion;
  if (!champion || !champions.hasOwnProperty(champion)) {
    return res.status(500).send({'error' : 'invalid champion'});
  }
  var level = parseInt(req.body.level);
  if ([0, 1, 2, 3, 4, 5].indexOf(level) == -1) {
    return res.status(500).send({'error' : 'invalid level'}); 
  }
  if (!req.session.user) {
    createUser(req.session);
  }
  var unlock = level == 5 ? 5 : level + 1;
  User.findById(req.session.user).exec(function(err, user) {
    var manual = user.get('manual.' + champion) || 0;
    var account = user.get('account.' + champion) || 0;
    if (unlock > manual) {
      user.set('manual.' + champion, unlock);
      user.save();
    }
    return res.send({'unlock' : unlock > manual && unlock > account});
  });
});

module.exports = router;
