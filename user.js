var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var crypto = require('crypto');
var secret = process.env.UNLOCK_SECRET || 'microtony';
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
  console.log(hash);                   
  var code = parseInt("0x" + hash.substr(0, 7)) % 900000 + 100000;
  console.log(code);
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
