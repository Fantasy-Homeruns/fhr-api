'use strict';

const _ = require('lodash');

let playerStats = {
  getPlayerSeason: (player, season) => {
    if (typeof player.seasons !== 'undefined') {
      return _.find(player.seasons, {'season': season});
    } else {
      return false;
    }
  },

  getPlayerTeam: (playerSeason, team) => {
    return _.find(playerSeason.teams, {'team': team});
  },

  addStat: (stats, no, date) => {
    no = parseInt(no);
    let stat = _.find(stats, {'no': no});
    if (!stat) {
      stats.push({
        'no': no,
        'date': date
      });
      return stats;
    } else {
      return false;
    }
  },

  calculateHrTotal: (teams) => {
    let total = 0, teamLeague;
    _.forEach(teams, (team) => {
      let maxStat = _.maxBy(team.stats, 'no');
      if (maxStat) {
        if (!teamLeague || teamLeague === team.teamLeague) {
          total = maxStat['no'];
        } else {
          total += maxStat['no'];
        }
      }
      teamLeague = team.teamLeague;
    });
    return total;
  },

  updateHrTotal: (hrTot, player, season) => {
    let playerSeason = playerStats.getPlayerSeason(player, season);
    playerSeason.hrTot = hrTot;
    return player;
  },

  getPlayerForOneSeason: (player, season) => {
    let playerSeason = playerStats.getPlayerSeason(player, season);
    player = _.merge(player, playerSeason);
    player = _.omit(player, ['seasons']);
    return player;
  },
};

module.exports = playerStats;
