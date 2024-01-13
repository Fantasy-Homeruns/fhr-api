'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const stats = require('./gameStats');

let game = {
  getOneGame: (id, callback) => {
    let dynamoDb = new AWS.DynamoDB.DocumentClient();
    var params = {
      TableName: process.env.FHR_TABLE,
      KeyConditionExpression:"#pk = :pkValue",
      ExpressionAttributeNames: {
          "#pk": "pk"
      },
      ExpressionAttributeValues: {
          ":pkValue": 'game-' + id
      }
    };

    dynamoDb.query(params, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, data.Items[0]);
      }
      return;
    });
  },

  getGames: (season, callback) => {
    if (!season) {
      let err = { error: "Missing season" };
      callback(err, null);
      return;
    }

    let dynamoDb = new AWS.DynamoDB.DocumentClient();
    var params = {
      TableName: process.env.FHR_TABLE,
      IndexName: "data_pk_index",
      KeyConditionExpression:"#data = :dataValue",
      ExpressionAttributeNames: {
          "#data": "data"
      },
      ExpressionAttributeValues: {
          ":dataValue": 'Game-' + season
      }
    };

    dynamoDb.query(params, (err, data) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, data.Items);
      }
      return;
    });
  },

  saveGame: (game, callback) => {
    let dynamoDb = new AWS.DynamoDB.DocumentClient();
    var params = {
      TableName: process.env.FHR_TABLE,
      Item: game,
    };

    dynamoDb.put(params, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, game);
      }
      return;
    });
  }
};

module.exports = game;
