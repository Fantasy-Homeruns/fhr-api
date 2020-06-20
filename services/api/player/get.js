'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();
const player = require('../lib/player');

module.exports.get = (event, context, callback) => {
  const { id } = event.pathParameters;

  player.getPlayerByEspnId(id, (err, result) => {
    var response = {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
    };

    if (err) {
      response.body = JSON.stringify(error, null, 2);
    } else {
      response.body = JSON.stringify(result, null, 2);
    }
    callback(null, response);
    return;
  });
};
