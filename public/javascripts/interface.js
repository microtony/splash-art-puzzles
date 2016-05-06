$(function() {

  GameUI = {
    champion: '',
    skin: '',
    unlockedLevel: 0,
    user: {},
    finishCb: function() {
      var champ = GameUI.champion;
      var champname = Champions[champ].name;
      $('#puzzle-main').addClass('puzzle-finished');
      $.post('/save', {
        champion: champ,
        level: Game.level
      }, function(res) {
        GameUI.updateLevels();
        //selectLevel(res.unlock || 0);
        if (res.unlock) {
          $('#reward-contents').empty();
          $('#reward-contents').append('<li>' + champname + ': Level ' + res.unlock + '</li>');
          for (var i in Champions[champ].skins) {
            if (Champions[champ].skins[i][2] == res.unlock) {
              $('#reward-contents').append('<li>Skin: ' + Champions[champ].skins[i][1] + '</li>');
            }
          }
          $('#reward-play').text('Play Level ' + res.unlock);
          $('#reward-result').modal('show');
        }
      })
    },
    updateLevels: function(cb) {
      $.get('/user', function(user) {
        GameUI.finishUpdateUser(user, cb);
      });
    },
    finishUpdateUser: function(user, cb) {
      GameUI.user = user;
      var levels = user.levels;
      for (var champ in Champions) {
        var level = levels[champ];
        if (!level) {
          $('#champion-select a[data-champion="' + champ + '"] span').hide();
        } else {
          $('#champion-select a[data-champion="' + champ + '"] span')
            .show().text(levels[champ]).attr('data-level', levels[champ]);
        }
      }
      GameUI.unlockedLevel = GameUI.user.levels[GameUI.champion] || 0;
      $('#navbar-collapse').attr('data-unlocked', GameUI.unlockedLevel);
      if (user.connected) {
        $('#user-username').text(user.username);
        $('#user-username').show();
        $('#user-guest').hide();
      } else {
        $('#unlock-code').text(user.unlockCode);
      }
      if (cb) {
        cb();
      }
    },
    randomSkin: function() {
      var keys = Object.keys(Champions);
      var len = keys.length;
      var id = Math.floor(Math.random() * len);
      var champ = keys[id];
      selectChampion(champ);
      var unlockedSkins = [];
      for (var i in Champions[champ].skins) {
        if (Champions[champ].skins[i][2] <= (GameUI.user.levels[champ] || 0)) {
          unlockedSkins.push(i);
        }
      }
      var len = unlockedSkins.length;
      selectSkin(champ, unlockedSkins[Math.floor(Math.random() * len)]);
      selectLevel(0);
    },
    updateMoves: function() {
      $('#game-moves').text(Game.moves);
      var diff = (new Date()) - Game.startTime;
      var minutes = Math.floor(diff / 60000);
      var colon = (Game.finished || diff % 1000 < 500) ? ':' : ' ';
      var seconds = Math.floor(diff % 60000 / 1000);
      if (seconds < 10) seconds = '0' + seconds;
      $('#game-time').text(minutes + colon + seconds);
    },
    clearMoves: function() {
      $('#game-moves').text('0');
      $('#game-time').text('0:00');
    }
  };

  var selectChampion = function(champ) {
    $('#puzzle-main').attr('data-champion', champ);
    $('#champion-selected').html('<img class="champion-icon" src="' + Champions[champ].icon + '"> ' + Champions[champ].name);
    $('#skin-select').empty();
    var champion = Champions[champ];
    selectSkin(champ, 0);
    GameUI.unlockedLevel = GameUI.user.levels[champ] || 0;
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
      $(".navbar-toggle:not(.collapsed)").trigger("click");
    });
  }
  var selectSkin = function(champ, num) {
    var name = Champions[champ].skins[num][1];
    $('#skin-selected').html(name == 'default' ? 'Default Skin' : name);
    $('#puzzle-main').attr('data-skin', Champions[champ].skins[num][0]);
    $('#hint').attr('data-skin', Champions[champ].skins[num][0]);
    GameUI.champion = champ;
    GameUI.skin = Champions[champ].skins[num][0];
    if (Game.finished) {
      Game.init();
    }
  };
  var selectLevel = function(level) {
    $('#level-selected').html('Level ' + level);
    $('#puzzle-main').attr('data-level', level);
    Game.level = level;
    Game.init();
  };
  for (var i = 0; i <= 7; i++) {
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
  $('#unlock-button').click(function() {
    if (!GameUI.user.unlockCode) {
      $.post('/init', {}, function(user) {
        GameUI.finishUpdateUser(user)
      });
    }
  });
  $('#unlock-form').submit(function(e) {
    e.preventDefault();
    $.post('/verify', {
      region : $('#unlock-region').val(),
      name : $('#unlock-name').val()
    }, function(res) {
      if (res.success) {
        location.reload();
      } else {
        $('#unlock-error').text(res.error);
      }
    });
  });
  $('#unlock-submit').click(function() {
    $('#unlock-form').submit();
  });
  $('#reward-play').click(function() {
    selectLevel(GameUI.unlockedLevel);
    $('#reward-result').modal('hide');
  });
});
