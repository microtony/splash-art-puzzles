var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var secret = process.env.UNLOCK_SECRET || 'microtony';
var https = require('https');
var Champions = require('./champions');

var userSchema = new Schema({
  connected: { type: Boolean, default: false },
  region: String,
  playerId: Number,
  name: String,
  manual: [{ champion: String, level: Number }],
  account: [{ champion: String, level: Number }],
  lastUpdate: Date
});

userSchema.index({ region: 1, playerId: 1 });
userSchema.methods.getUnlockCode = function() {
  var hash = crypto.createHmac('sha256', secret)
                   .update(this.id)
                   .digest('hex');    
  var code = parseInt("0x" + hash.substr(0, 7)) % 900000 + 100000;
  return code;
}
userSchema.methods.getCompactObject = function() {
  var levels = {};
  for (var i in this.manual) {
    var champ = this.manual[i].champion;
    levels[champ] = this.manual[i].level;
  }
  for (var i in this.account) {
    var champ = this.account[i].champion;
    if (!levels.hasOwnProperty(champ) || this.account[i].level > levels[champ]) {
      levels[champ] = this.account[i].level;
    }
  }
  if (this.connected) {
    return {
      connected: true,
      username: this.name + ' (' + this.region + ')',
      levels: levels
    };
  } else {
    return {
      connected: false,
      unlockCode: this.getUnlockCode(),
      levels: levels
    };
  }
}
userSchema.methods.isUpdateRequired = function() {
  if (!this.connected) {
    return false;
  }
  if (!this.lastUpdate) {
    return true;
  }
  var diff = new Date() - this.lastUpdate;
  return diff > 3600 * 1000;
}
userSchema.methods.updateAccount = function(cb) {
  var urlPrefix = 'https://' + this.region.toLowerCase() + '.api.pvp.net/championmastery/location/' + this.region + '1/player/';
  var urlSuffix = '?api_key=' + process.env.API_KEY;
  var keyToId = {};
  for (var i in Champions) {
    keyToId[Champions[i].key] = i;
  }
  var that = this;
  https.get(urlPrefix + this.playerId + '/champions' + urlSuffix, function(res1) {
    if (res1.statusCode != 200) {
      console.log(res1);
      return ;
    }
    var body = '';
    res1.on('data', function(chunk) {
      body += chunk;
    });
    res1.on('end', function() {
      var champions = JSON.parse(body);
      that.account = [];
      for (var i in champions) {
        that.account.push({
          'champion' : keyToId[champions[i].championId],
          'level' : champions[i].championLevel
        });
      }
      that.lastUpdate = new Date();
      that.save();
      if (cb) {
        cb();
      }
    });
  });
}
userSchema.statics.getByRegionAndId = function(region, id, cb) {
  this.where('region', region).where('playerId', id).exec(function(err, u) {
    if (!u) {
      u = new this.model('User');
      u.connected = true;
      u.region = region;
      u.playerId = id;
      u.save();
    }
    cb(u);
  });
}
userSchema.statics.getEmptyObject = function() {
  return {
    connected: false,
    unlockCode: '',
    levels: {}
  };
}
var model = mongoose.model("User", userSchema);
module.exports = model;
