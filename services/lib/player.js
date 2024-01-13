'use strict';

const _ = require('lodash');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const stats = require('./playerStats');

let player = {
  getPlayerById: (id, callback) => {
    if (!id) {
      let err = { error: "Missing id" };
      callback(err, null);
      return;
    }
    let dynamoDb = new AWS.DynamoDB.DocumentClient();
    var params = {
      TableName: process.env.FHR_TABLE,
      KeyConditionExpression:"#pk = :pkValue",
      ExpressionAttributeNames: {
          "#pk": "pk"
      },
      ExpressionAttributeValues: {
          ":pkValue": 'player-' + id
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

  getPlayerByEspnId: (id, callback) => {
    if (!id) {
      let err = { error: "Missing id" };
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
          ":dataValue": 'PlayerEspn-' + id
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

  updatePlayerStats: (player, season, team, no, date) => {
    let playerSeason = stats.getPlayerSeason(player, season);

    if (!playerSeason) {
      console.log('No season', season, player.lastName);
      return false;
    }

    let playerTeam = stats.getPlayerTeam(playerSeason, team);

    if (!playerTeam || !playerTeam.stats) {
      console.log('No team or stats', player.lastName);
      return false;
    }

    // Update season stats
    let seasonStats = stats.addStat(playerTeam.stats, no, date);
    if (seasonStats) {
      playerTeam.stats = seasonStats;
    } else {
      console.log('No stat to add', player.lastName);
      return false;
    }

    let hrTot = stats.calculateHrTotal(playerSeason.teams);
    player = stats.updateHrTotal(hrTot, player, season);

    return player;
  },

  updateAllPlayerStats: (player) => {
    _.forEach(player.seasons, (playerSeason) => {
      let hrTot = stats.calculateHrTotal(playerSeason.teams);
      player = stats.updateHrTotal(hrTot, player, playerSeason.season);
    });
    return player;
  },

  savePlayer: (player, callback) => {
    let dynamoDb = new AWS.DynamoDB.DocumentClient();
    var params = {
      TableName: process.env.FHR_TABLE,
      Item: player,
    };

    dynamoDb.put(params, (err, result) => {
      if (err) {
        callback(err, null);
      } else {
        callback(null, player);
      }
      return;
    });
  },
}

module.exports = player;
