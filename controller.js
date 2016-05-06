var express = require('express');
var router = express.Router();
var User = require('./user');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;
var champions = require('./champions');
var https = require('https');

router.get('/user', function(req, res, next) {
  if (!req.session.user) {
    return res.send(User.getEmptyObject());
  }
  User.findById(req.session.user).exec(function(err, user) {
    if (err || !user) {
      req.session.user = null;
      return res.send(User.getEmptyObject());
    }
    res.send(user.getCompactObject());
  });
});

router.post('/init', function(req, res, next) {
  User.findById(req.session.user).exec(function(err, user) {
    if (user) {
      return res.send(user.getCompactObject());
    }
    user = new User();
    user.save(function(err) {
      req.session.user = user.id;
      res.send(user.getCompactObject());
    });
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

router.post('/verify', function(req, res, next) {
  User.findById(req.session.user).exec(function(err, user) {
    if (err || !user || user.connected) {
      return res.status(500).send({ 'error' : 'unknown error' });
    }
    var code = user.getUnlockCode();

    var success = function(region, name, id) {
      User.findOne({ 'region': region, 'playerId': id }).exec(function(err, acUser) {
        if (!acUser) {
          // simply change current user's region and playerId
          user.connected = true;
          user.region = region;
          user.name = name;
          user.playerId = id;
          user.save();
          user.updateAccount();
        } else {
          // merge levels from session user to acuser
          var manual = {};
          for (var i in user.manual) {
            manual[user.manual[i].champion] = user.manual[i].level;
          }
          for (var i in acUser.manual) {
            var oldLevel = manual[acUser.manual[i].champion] || 0;
            manual[acUser.manual[i].champion] = Math.max(oldLevel, acUser.manual[i].level);
          }
          acUser.manual = [];
          for (var i in manual) {
            acUser.manual.push({ 'champion' : i, 'level' : manual[i] });
          }
          acUser.save();
          acUser.updateAccount();
          req.session.user = acUser.id;
        }
        setTimeout(function() {
          res.send({ 'success' : true });
        }, 500);
      });
    }

    var fail = function() {
      return res.send({ 'success' : false, 'error' : 'Code not found in mastery pages' });
    }

    var region = req.body.region;
    if (['BR', 'EUNE', 'EUW', 'JP', 'KR', 'LAN', 'LAS', 'NA', 'OCE', 'RU', 'TR'].indexOf(region) == -1) {
      return res.status(500).send({ 'error' : 'invalid region' }); 
    }
    var name = req.body.name;
    var urlPrefix = 'https://' + region.toLowerCase() + '.api.pvp.net/api/lol/' + region.toLowerCase() + '/v1.4/summoner/';
    var urlSuffix = '?api_key=' + process.env.API_KEY;
    https.get(urlPrefix + 'by-name/' + name + urlSuffix, function(res1) {
      if (res1.statusCode != 200) {
        return res.send({ 'success' : false, 'error' : 'Summoner not found' });
      }
      var body = '';
      res1.on('data', function(chunk) {
        body += chunk;
      });
      res1.on('end', function() {
        var user = JSON.parse(body);
        var name = Object.keys(user)[0];
        var id = user[name].id;
        https.get(urlPrefix + id + '/masteries' + urlSuffix, function(res2) {
          var body2 = '';
          res2.on('data', function(chunk) {
            body2 += chunk;
          });
          res2.on('end', function() {
            var masteries = JSON.parse(body2);
            var pages = masteries[id]['pages'];
            for (var i in pages) {
              if (pages[i].name.indexOf(code) != -1) {
                return success(region, name, id);
              }
            }
            return fail();
          });
        });
      });
    }).on('error', function() {
      return res.status(500).send({ 'error' : 'unknown error' });
    });

  });

});

module.exports = router;
