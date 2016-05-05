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
        alert(res);
      })
    },
    updateLevels: function() {
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
      });
    }
  };

  var selectChampion = function(champ) {
    $('#puzzle-main').attr('data-champion', champ);
    $('#champion-selected').html('<img class="champion-icon" src="' + Champions[champ].icon + '"> ' + Champions[champ].name);
    $('#skin-select').empty();
    var champion = Champions[champ];
    selectSkin(champ, 0);
    GameUI.unlockedLevel = GameUI.user[champ] || 0;
    $('#level-select').attr('data-unlocked', GameUI.unlockedLevel);
    selectLevel(GameUI.unlockedLevel);
    for (var i in champion.skins) {
      var s = '<li><a href="#" data-champion="' + champ + '" data-skin="' + i + '">';
      s += champion.skins[i][1] == 'default' ? 'Default Skin' : champion.skins[i][1];
      s += '</a></li>';
      $('#skin-select').append(s);
    };
    $('#skin-select a').click(function(e) {
      var skin = $(this);
      selectSkin(skin.attr('data-champion'), parseInt(skin.attr('data-skin')));
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
  (function() {
    var keys = Object.keys(Champions);
    var len = keys.length;
    var id = Math.floor(Math.random() * len);
    var champ = keys[id];
    selectChampion(champ);
    len = Champions[champ].skins.length;
    selectSkin(champ, Math.floor(Math.random() * len));
    selectLevel(0);
  })();
  $('#champion-select').mousewheel(function(event, delta) {
    this.scrollLeft -= (delta * 30);
    event.preventDefault();
  });

  GameUI.updateLevels();
  
});
