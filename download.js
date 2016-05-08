var fs = require('fs');
var http = require('http');
var https = require('https');

var saveFiles = function(champions, skins) {
  fs.writeFile('./public/sass/skins.scss', '$skins: (\n' + skins.join('\n') + '\n);');
  fs.writeFile('./champions.js', 'module.exports = ' + JSON.stringify(champions));
  fs.writeFile('./public/javascripts/champions.js', 'Champions = ' + JSON.stringify(champions));
}

var loadNextChampion = function(keys, allChampions, allSkins, cb) {
  if (keys.length == 0) {
    return cb(allChampions, allSkins);
  }
  var id = keys.shift();
  var detailUrl = prefix + '/champion/' + id + '.json';
  http.get(detailUrl, function(res1) {
    var body = '';
    res1.on('data', function(chunk) {
      body += chunk;
    });
    res1.on('end', function() {
      var details = JSON.parse(body);
      var skins = details.data[id].skins;
      var skinData = [];
      for (var i in skins) {
        var skinId = id + '_' + skins[i].num;
        allSkins.push(skinId + ': "' + cdn + '/img/champion/splash/' + skinId + '.jpg",');
        var reqLevel = 0;
        if (skins[i].num > 0) {
          var sum = skins[i].name.split('').map(function (c) {
            return c.charCodeAt(0);
          }).reduce(function(x, y) {
            return x + y;
          });
          reqLevel = sum % 7 + 1;
        }
        skinData.push([skinId, skins[i].name, reqLevel]);
      }
      console.log(id);
      allChampions[id] = {
        'id' : id,
        'key' : parseInt(details.data[id].key),
        'name' : details.data[id].name,
        'skins' : skinData,
        'icon' : cdn + '/' + ver + '/img/champion/' + id + '.png'
      };
      loadNextChampion(keys, allChampions, allSkins, cb);
    });
  });
}
var getChampions = function() {
  var championUrl = prefix + '/champion.json';
  http.get(championUrl, function(res1) {
    var body = '';
    res1.on('data', function(chunk) {
      body += chunk;
    });
    res1.on('end', function() {
      var champions = JSON.parse(body);
      loadNextChampion(Object.keys(champions.data), {}, [], saveFiles);
    });
  });
}

var versionUrl = 'https://ddragon.leagueoflegends.com/realms/na.json';
var cdn = '';
var ver = '';
var prefix = '';
https.get(versionUrl, function(res1) {
  var body = '';
  res1.on('data', function(chunk) {
    body += chunk;
  });
  res1.on('end', function() {
    var version = JSON.parse(body);
    cdn = version.cdn;
    ver = version.dd;
    prefix = version.cdn + '/' + version.dd + '/data/' + version.l;
    getChampions();
  });
});
