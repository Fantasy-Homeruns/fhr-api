'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const stats = require('./gameStats');

let game = {
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
  },

  buildGame: (data) => {
    return {
      "pk": "game-" + data.id,
      "sk": data.id,
      "leagueId": data.leagueId
    };
  },

  buildTeam: (data) => {
    return {
      "user": "user-" + data.userId,
      "teamName": data.teamName,
      "draftOrder": data.draftOrder,
      "hrTot": 0,
      "standing": 1
    };
  },

  buildPick: (data) => {
    return {
      "playerId": "player-" + data.PlayerSeason.playerId,
      "player": {},
      "round": data.round,
      "time": data.time,
      "active": data.active,
      "reentry": data.reentry,
      "dropTime": data.dropTime
    };
  }
};

module.exports = game;
