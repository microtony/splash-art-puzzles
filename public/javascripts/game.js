$(function() {
  Game = {
    levels: [
      [2, 3], [3, 4], [3, 5], [4, 6], [4, 7], [5, 8], [5, 9], [6, 10]
    ],
    level: 0,
    levelw: 0,
    levelh: 0,
    size: 0,
    blank: 0,
    blankn: 0,
    blanke: 0,
    blanks: 0,
    blankw: 0,
    moves: 0,
    startTime: 0,
    timer: false,
    finished: false,
    puzzle: [],
    init: function() {
      this.levelh = this.levels[this.level][0];
      this.levelw = this.levels[this.level][1];
      this.size = this.levelh * this.levelw;
      var s;
      $('#puzzle-wrapper').empty();
      this.puzzle = [];
      for (var i = 0; i < this.size; i++) {
        if (i == (this.levelh - 1) * this.levelw) {
          this.puzzle.push(-1);
          continue;
        }
        s = '<div class="puzzle-cell" data-cell="' + i + '" data-pos="' + i + '"></div>';
        $('#puzzle-wrapper').append(s);
        this.puzzle.push(i);
      }
      $('.puzzle-cell').click(this.cellClick);
      this.finished = false;
      $('#puzzle-main').removeClass('puzzle-finished');
      this.shuffle();
      this.moves = 0;
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = false;
        GameUI.clearMoves(0);
      }
    },
    shuffle: function() {
      while (true) {
        for (var i = 1; i < Game.size; i++) {
          var newpos = Math.floor(Math.random() * (i + 1));
          var t = Game.puzzle[newpos];
          Game.puzzle[newpos] = Game.puzzle[i];
          Game.puzzle[i] = t;
        }
        var inv = 0, blankrow = 0;
        for (var i = 0; i < Game.size; i++) {
          if (Game.puzzle[i] == -1) {
            blankrow = Math.floor(i / Game.levelw);
            continue;
          }
          for (var j = i + 1; j < Game.size; j++) {
            if (Game.puzzle[j] == -1) continue;
            inv += Game.puzzle[i] > Game.puzzle[j];
          }
        }
        if (Game.checkFinish()) {
          continue;
        }
        if (Game.levelw % 2 == 0) {
          if (inv % 2 != (Game.levelh - blankrow) % 2) {
            break;
          }
        } else if (inv % 2 == 0) {
          break;
        }
      }
      for (var i = 0; i < Game.size; i++) {
        if (Game.puzzle[i] == -1) {
          Game.blank = i;
          continue;
        }
        $('.puzzle-cell[data-cell=' + Game.puzzle[i] + ']').attr('data-pos', i);
      }
      Game.moveBlank();
    },
    moveBlank: function() {
      if (Game.checkFinish()) {
        Game.finished = true;
        clearInterval(Game.timer);
        Game.timer = false;
        GameUI.finishCb();
        return ;
      }
      $('.puzzle-cell').removeClass('movable');
      if (Game.blank >= Game.levelw) {
        Game.blankn = Game.blank - Game.levelw;
        $('.puzzle-cell[data-pos=' + Game.blankn + ']').addClass('movable');
      } else {
        Game.blankn = -1;
      }
      if (Game.blank + Game.levelw < Game.size) {
        Game.blanks = Game.blank + Game.levelw;
        $('.puzzle-cell[data-pos=' + Game.blanks + ']').addClass('movable');
      } else {
        Game.blanks = -1;
      }
      if ((Game.blank + 1) % Game.levelw != 0) {
        Game.blanke = Game.blank + 1;
        $('.puzzle-cell[data-pos=' + Game.blanke + ']').addClass('movable');
      } else {
        Game.blanke = -1;
      }
      if (Game.blank % Game.levelw != 0) {
        Game.blankw = Game.blank - 1;
        $('.puzzle-cell[data-pos=' + Game.blankw + ']').addClass('movable');
      } else {
        Game.blankw = -1;
      }
    },
    directions: ['blankn', 'blanke', 'blanks', 'blankw'],
    cellClick: function() {
      var cell = $(this);
      var pos = parseInt(cell.attr('data-pos'));
      var moved = false;
      for (var i = 0; i < 4; i++) {
        if (pos == Game[Game.directions[i]]) {
          cell.attr('data-pos', Game.blank);
          Game.puzzle[Game.blank] = Game.puzzle[pos];
          Game.puzzle[pos] = -1;
          Game.blank = pos;
          moved = true;
          break;
        }
      }
      if (!moved) {
        return ;
      }
      Game.moves++;
      if (Game.moves == 1) {
        Game.startTime = new Date();
        Game.timer = setInterval(GameUI.updateMoves, 50);
      }
      Game.moveBlank();
      GameUI.updateMoves();
    },
    checkFinish: function() {
      if (Game.finished) {
        return true;
      }
      for (var i = 0; i < Game.size; i++) {
        if (i == Game.size - Game.levelw) {
          if (Game.puzzle[i] != -1) {
            return false;
          }
        } else {
          if (Game.puzzle[i] != i) {
            return false;
          }
        }
      }
      return true;
    }
  };
});