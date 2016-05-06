$(function() {

  GameUI = {
    champion: '',
    skin: '',
    unlockedLevel: 0,
    user: {},
    finishCb: function() {
      $('#puzzle-main').addClass('puzzle-finished');
      $.post('/save', {
        champion: GameUI.champion,
        level: Game.level
      }, function(res) {
        GameUI.updateLevels();
        selectLevel(res.unlock || 0);
      })
    },
    updateLevels: function(cb) {
      $.get('/user', function(user) {
        GameUI.user = user;
        for (var champ in Champions) {
          var level = user[champ];
          if (!level) {
            $('#champion-select a[data-champion="' + champ + '"] span').hide();
          } else {
            $('#champion-select a[data-champion="' + champ + '"] span')
              .show().text(user[champ]).attr('data-level', user[champ]);
          }
        }
        GameUI.unlockedLevel = GameUI.user[GameUI.champion] || 0;
        $('#navbar-collapse').attr('data-unlocked', GameUI.unlockedLevel);
        if (cb) {
          cb();
        }
      });
    },
    randomSkin: function() {
      var keys = Object.keys(Champions);
      var len = keys.length;
      var id = Math.floor(Math.random() * len);
      var champ = keys[id];
      selectChampion(champ);
      var unlockedSkins = [];
      for (var i in Champions[champ].skins) {
        if (Champions[champ].skins[i][2] <= (GameUI.user[champ] || 0)) {
          unlockedSkins.push(i);
        }
      }
      var len = unlockedSkins.length;
      selectSkin(champ, unlockedSkins[Math.floor(Math.random() * len)]);
      selectLevel(0);
    }
  };

  var selectChampion = function(champ) {
    $('#puzzle-main').attr('data-champion', champ);
    $('#champion-selected').html('<img class="champion-icon" src="' + Champions[champ].icon + '"> ' + Champions[champ].name);
    $('#skin-select').empty();
    var champion = Champions[champ];
    selectSkin(champ, 0);
    GameUI.unlockedLevel = GameUI.user[champ] || 0;
    $('#navbar-collapse').attr('data-unlocked', GameUI.unlockedLevel);
    selectLevel(GameUI.unlockedLevel);
    for (var i in champion.skins) {
      var s = '<li data-level="' + champion.skins[i][2] + '"">';
      s += '<a href="#" data-champion="' + champ + '" data-skin="' + i + '">';
      s += champion.skins[i][1] == 'default' ? 'Default Skin' : champion.skins[i][1];
      s += ' <span class="level-lock">🔒 ' + champion.skins[i][2] + ' </span>';
      s += '</a></li>';
      $('#skin-select').append(s);
    };
    $('#skin-select a').click(function(e) {
      var skin = $(this);
      var champ = skin.attr('data-champion');
      var skinid = parseInt(skin.attr('data-skin'));
      if (GameUI.unlockedLevel < Champions[champ].skins[skinid][2]) {
        e.stopPropagation();
        return ;
      }
      selectSkin(champ, skinid);
    });
  }
  var selectSkin = function(champ, num) {
    var name = Champions[champ].skins[num][1];
    $('#skin-selected').html(name == 'default' ? 'Default Skin' : name);
    $('#puzzle-main').attr('data-skin', Champions[champ].skins[num][0]);
    $('#hint').attr('data-skin', Champions[champ].skins[num][0]);
    GameUI.champion = champ;
    GameUI.skin = Champions[champ].skins[num][0];
  };
  var selectLevel = function(level) {
    $('#level-selected').html('Level ' + level);
    $('#puzzle-main').attr('data-level', level);
    Game.level = level;
    Game.init();
  };
  for (var i = 0; i <= 5; i++) {
    $('#level-select-' + i + ' a').click(function(i) {
      return function(e) {
        if (GameUI.unlockedLevel < i) {
          e.stopPropagation();
          return ;
        }
        selectLevel(i);
        $(".navbar-toggle:not(.collapsed)").trigger("click");
      };
    }(i));
  };
  $('#champion-select').empty();
  for (var i in Champions) {
    var s = '<li><a href="#" data-champion="' + Champions[i].id  + '">';
    s += '<img class="champion-icon" src="' + Champions[i].icon + '"> ' + Champions[i].name;
    s += ' <span class="badge">0</span>';
    s += '</a></li>';
    $('#champion-select').append(s);
  }
  $('#champion-select a').click(function(e) {
    e.stopPropagation();
    selectChampion($(this).attr('data-champion'));
    $('#skin-select-toggle').dropdown('toggle');
  });
  GameUI.updateLevels(GameUI.randomSkin);
  $('#champion-select').mousewheel(function(event, delta) {
    this.scrollLeft -= (delta * 30);
    event.preventDefault();
  });
  $('#navbar-brand').click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    GameUI.randomSkin();
  });
});
