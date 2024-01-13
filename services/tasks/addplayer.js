'use strict';

const _ = require('lodash');
const playerLib = require('../lib/player');

module.exports.add = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'SQS event processed.',
      input: event,
    }),
  };

  _.forEach(event.Records, (record) => {
    let player = JSON.parse(record.body);
    player = playerLib.updateAllPlayerStats(player);
    playerLib.savePlayer(player, (err, success) => {
      if (err) {
        console.log('Error: ', err);
      } else {
        console.log('Success! Saved: ', player.playerName);
      }
    });
  });

  callback(null, response);
};
