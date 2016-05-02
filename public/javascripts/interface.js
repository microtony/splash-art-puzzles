$(function() {
  var selectChampion = function(champ) {
    $('#puzzle-main').attr('data-champion', champ);
    $('#champion-selected').html('<img class="champion-icon" src="' + Champions[champ].icon + '"> ' + Champions[champ].name);
    $('#skin-select').empty();
    var champion = Champions[champ];
    selectSkin(champ, 0);
    for (var i in champion.skins) {
      var s = '<li><a href="#" data-champion="' + champ + '" data-skin="' + i + '">';
      s += champion.skins[i][1] == 'default' ? 'Default Skin' : champion.skins[i][1];
      s += '</a></li>';
      $('#skin-select').append(s);
    };
    $('#skin-select a').click(function(e) {
      var skin = $(this);
      selectSkin(parseInt(skin.attr('data-champion')), parseInt(skin.attr('data-skin')));
    });
  }
  var selectSkin = function(champ, num) {
    var name = Champions[champ].skins[num][1];
    $('#skin-selected').html(name == 'default' ? 'Default Skin' : name);
    $('#puzzle-main').attr('data-skin', Champions[champ].skins[num][0]);
    $('#hint').attr('data-skin', Champions[champ].skins[num][0]);
  };
  var selectTier = function(tier) {
    $('#tier-selected').html('Level ' + tier);
    $('#puzzle-main').attr('data-tier', tier);
    Game.init();
    $(".navbar-toggle:not(.collapsed)").trigger("click");
  };
  for (var i = 0; i <= 5; i++) {
    $('#tier-select-' + i + ' a').click(function(i) {
      return function(e) {
        if ($(this).parent().hasClass('disabled')) {
          e.stopPropagation();
          return ;
        }
        selectTier(i);
      };
    }(i));
  };
  $('#champion-select').empty();
  for (var i in Champions) {
    var s = '<li><a href="#" data-champion="' + i + '">';
    s += '<img class="champion-icon" src="' + Champions[i].icon + '"> ' + Champions[i].name;
    s += '</a></li>';
    $('#champion-select').append(s);
  }
  $('#champion-select a').click(function(e) {
    e.stopPropagation();
    selectChampion(parseInt($(this).attr('data-champion')));
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
    selectTier(0);
  })();
  $('#champion-select').mousewheel(function(event, delta) {
    this.scrollLeft -= (delta * 30);
    event.preventDefault();
  });
});