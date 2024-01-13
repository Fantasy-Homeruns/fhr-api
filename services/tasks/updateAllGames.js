'use strict';

const _ = require('lodash');
const gameLib = require('../lib/game');
const gameStatsLib = require('../lib/gameStats');
const playerStatsLib = require('../lib/playerStats');

module.exports.update = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'SQS event processed for updating player and stats in all active games',
      input: event,
    }),
  };

  let season = new Date().getFullYear();
  season = 2019;

  _.forEach(event.Records, (record) => {
    let player = JSON.parse(record.body);
    console.log('Player homerun hit: ' + player.displayName);

    // Set player for one season with stats
    player = playerStatsLib.getPlayerForOneSeason(player, season);
    console.log('Player', JSON.stringify(player));

    // Get all games
    gameLib.getGames(season, (err, games) => {
      if (err) {
        console.log('Err finding games', JSON.stringify(err));
      } else {
        console.log('Found games for this season', games.length);

        _.forEach(games, (game) => {
          let gameObjUpdated = gameStatsLib.findAndUpdatePlayer(player, game);
          if (gameObjUpdated) {
            // Replace player in each game if player exists & recalc totals
            console.log('Updating game players', game.pk, player.displayName);
            gameObjUpdated = gameStatsLib.calculateTotals(gameObjUpdated);
            console.log('GameUpdated', JSON.stringify(gameObjUpdated));

            // Save game
            gameLib.saveGame(gameObjUpdated, (err, result) => {
              if (err) {
                console.log('Err on game save', game.pk, player.displayName, JSON.stringify(err));
              } else {
                console.log('Game saved', game.pk, player.displayName);
              }
            });
          }
        });
      }
    });
  });

  callback(null, response);
};
