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

var model = mongoose.model("User", userSchema);
module.exports = model;
