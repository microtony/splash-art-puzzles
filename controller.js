var express = require('express');
var router = express.Router();
var User = require('./user');
var mongoose = require('mongoose');
var ObjectId = mongoose.Types.ObjectId;

router.get('/user', function(req, res, next) {
  //res.render('index', { title: 'Express' });
  if (!req.session.user) {
    var user = new User();
    user.save();
    req.session.user = user.id;
  }
  User.find({ id: ObjectId(req.session.user) }).exec(function(err, user) {
    res.send(user);
  });
});

module.exports = router;
