'use strict';

const _ = require('lodash');
const gameLib = require('../lib/game');

module.exports.sync = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Roger Roger',
      input: event,
    }),
  };

  gameLib.getOneGame(event.gameId, (err, game) => {
    if (err) {
      console.error('Cannot get game', event.gameId, JSON.stringify(err));
    } else {
      _.forEach(game.teams, (team) => {
        _.forEach(team.picks, (pick) => {
          sendToSqsUpdateGame({
            gameId: game.sk,
            playerId: pick.playerId
          });
        });
      });
      callback(null, response);
    }
  });
};

function sendToSqsUpdateGame(message) {
  let params = {
    MessageBody: JSON.stringify(message),
    QueueUrl: 'https://sqs.us-west-2.amazonaws.com/576404071076/FHR-UpdateGame-dev'
  };

  var AWS = require('aws-sdk');
  var sqs = new AWS.SQS({
    region: 'us-west-2'
  });

  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.error("Failed to send message to update game" + err);
    } else {
      console.log('Success sending data:', data.MessageId);
    }
  });
}
