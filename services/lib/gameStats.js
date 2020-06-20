'use strict';

const _ = require('lodash');

let gameStats = {
  updateAllPlayers: (game) => {
    return true;
  },

  findAndUpdatePlayer: (player, game) => {
    let found = false;
    _.forEach(game.teams, (team) => {
      _.forEach(team.picks, (pick) => {
        if (pick.playerId === player.sk) {
          pick.player = player;
          found = true;
        }
      });
    });
    if (found === true) {
      return game;
    } else {
      return false;
    }
  },

  calculateTotals: (game) => {
    _.forEach(game.teams, (team) => {
      team.hrTot = 0;
      _.forEach(team.picks, (pick) => {
        if (pick.player && pick.player.hrTot > 0) {
          team.hrTot += pick.player.hrTot;
        }
      });
    });
    return game;
  },

  calculateStandings: (game) => {

  },
};

module.exports = gameStats;
