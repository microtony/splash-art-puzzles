var mongoose = require('mongoose');
var Schema = mongoose.Schema;

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
var model = mongoose.model("User", userSchema);
module.exports = model;
