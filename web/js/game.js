Game = {
  tiers: [
    [2, 3], [3, 4], [3, 5], [4, 6], [4, 7], [5, 8]
  ],
  tier: 0,
  tierw: 0,
  tierh: 0,
  puzzle: [],
  init: function() {
    this.tier = parseInt($('#puzzle-main').attr('data-tier'));
    this.tierh = this.tiers[this.tier][0];
    this.tierw = this.tiers[this.tier][1];
    var s;
    $('#puzzle-wrapper').empty();
    this.puzzle = [];
    for (var i = 0; i < this.tierh * this.tierw; i++) {
      if (i == (this.tierh - 1) * this.tierw) {
        this.puzzle.push(-1);
        continue;
      }
      s = '<div class="puzzle-cell" data-cell="' + i + '" data-pos="' + i + '"></div>';
      $('#puzzle-wrapper').append(s);
      this.puzzle.push(i);
    }
    this.shuffle();
  },
  shuffle: function() {
    for (var i = 1; i < Game.tierh * Game.tierw; i++) {
      var newpos = Math.floor(Math.random() * (i + 1));
      var t = Game.puzzle[newpos];
      Game.puzzle[newpos] = Game.puzzle[i];
      Game.puzzle[i] = t;
      $('.puzzle-cell[data-cell=' + Game.puzzle[newpos] + ']').attr('data-pos', newpos);
      $('.puzzle-cell[data-cell=' + Game.puzzle[i] + ']').attr('data-pos', i);
    }
  }
};
