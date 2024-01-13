'use strict';

const _ = require('lodash');
const gameLib = require('../lib/game');
const gameStatsLib = require('../lib/gameStats');
const playerLib = require('../lib/player');
const playerStatsLib = require('../lib/playerStats');

module.exports.update = async (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'SQS event processed for updating game stats',
      input: event,
    }),
  };

  console.log('Lambda triggered', event.Records.length);

  _.forEach(event.Records, (record) => {
    let message = JSON.parse(record.body);
    console.log('Event to Update Game', 'game: ' + message.gameId, ' with player: ' + message.playerId);

    // Get current game from DB
    gameLib.getOneGame(message.gameId, (err, game) => {
      if (err) {
        console.error('Could not find game', JSON.stringify(err));
      } else {

        playerLib.getPlayerById(message.playerId, (err, player) => {

          // Set player for one season with stats
          player = playerStatsLib.getPlayerForOneSeason(player, game.season);

          let gameObjUpdated = gameStatsLib.findAndUpdatePlayer(player, game);
          if (gameObjUpdated) {
            // Replace player if player exists & recalc totals
            console.log('Updating game player', game.pk, player.displayName);
            gameObjUpdated = gameStatsLib.calculateTotals(gameObjUpdated);

            // Save game
            gameLib.saveGame(gameObjUpdated, (err, result) => {
              if (err) {
                console.log('Err on game save', game.pk, player.displayName, JSON.stringify(err));
                callback(err, null);
              } else {
                console.log('Game saved', game.pk, player.displayName);
                callback(null, response);
              }
            });
          }
        });

      }
    });
  });


};
