var express = require('express');
var router = express.Router();
var User = require('./user');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var champions = require('./champions');

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
  var unlock = level == 5 ? 5 : level + 1;
  var unlockLevel = function(user) {
    var manual = 0;
    var account = 0;
    for (var i in user.account) {
      if (user.account[i].champion == champion) {
        account = user.account[i].level;
        break;
      }
    }
    var found = false;
    for (var i in user.manual) {
      if (user.manual[i].champion == champion) {
        found = true;
        manual = user.manual[i].level;
        if (unlock > manual) {
          user.manual[i].level = unlock;
        }
        break;
      }
    }
    if (!found) {
      user.manual.push({ champion: champion, level: unlock });
    }
    user.save();
    return res.send({'unlock' : (unlock > manual && unlock > account) ? unlock : false});
  }
  User.findById(req.session.user).exec(function(err, user) {
    if (!user) {
      user = new User();
      user.save(function(err) {
        req.session.user = user.id;
        unlockLevel(user);
      });
    } else {
      unlockLevel(user);
    }
  });
});

module.exports = router;
