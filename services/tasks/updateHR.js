'use strict';

const env = process.env.NODE_ENV || 'development';
const _ = require('lodash');
const scrapeTools = require('./scrapeTools');
const request = require('request-promise');
const cheerio = require('cheerio');
const notify = require('../lib/notify');
const playerLib = require('../lib/player');

// Show console logs
var debug = (env === 'development') ? true : false;
var games = [];

module.exports.update = (event, context, callback) => {
  const response = {
    statusCode: 200,
    body: JSON.stringify({
      message: 'HR Update complete',
      input: event,
    }),
  };

  let date = (event.date) ? event.date : getDate();
  let url = 'https://www.espn.com/mlb/scoreboard/_/date/' + date;
  var dateHit = date.toString().substr(0,4) + '-' + date.toString().substr(4,2) + '-' + date.toString().substr(6,2);

  if (debug) console.log('[Add Players] Getting scoreboard results for: ', url);

  request(url)
  .then(function (html) {
    let results = html.split('http://www.espn.com/mlb/boxscore?gameId=');
    results.shift();
    games = _.map(results, function(game) {
      let getGameId = game.split('"');
  	  let gameId = getGameId[0];
      if (gameId) {
        let gameBoxScore = 'http://www.espn.com/mlb/boxscore?gameId=' + gameId;
        return gameBoxScore;
      }
    });
    return _.uniq(games);
  })
  .then(function (games) {
    _.forEach(games, function(game) {
      getGameBoxScore(game, dateHit);
    });
  })
  .then(function (result) {
    callback(null, response);
  })
  .catch(function (err) {
    console.error('[AddHomerunsScript] Error', err);
  });

};

function getDate() {
  let season = new Date().getFullYear();
  season = 2019;
  let d = new Date();
  let today = new Date();
  today.setHours(d.getHours() - 8);

  let nowMonth = today.getMonth() + 1;
  if (nowMonth < 10) nowMonth = "0" + nowMonth.toString();
  let nowDay = today.getDate();
  if (nowDay < 10) nowDay = "0" + nowDay.toString();
  return season.toString() + nowMonth.toString() + nowDay.toString();
}

function getGameBoxScore(gameBoxScore, dateHit) {
  request(gameBoxScore)
    .then(function (htmlBox) {
      if (debug) console.log('Get box score for', gameBoxScore);

      // Search for 'hitting' and get code by TEAM
      let teamResults = htmlBox.split('Hitting');

      // First team
      getHomerunsAndAddThem(teamResults[1], gameBoxScore, dateHit);

      // Second team
      getHomerunsAndAddThem(teamResults[2], gameBoxScore, dateHit);

      return true;
    })
    .catch(function (err) {
      console.error('[AddHomerunsScript] Error', err);
    });
}

function getHomerunsAndAddThem(content, gameBoxScore, dateHit) {
  var season = new Date().getFullYear();
  season = 2019;
  var resultsBox = content.split('HR:</div>');
  if (resultsBox) {
    resultsBox.shift();
    _.forEach(resultsBox, function(homerLine) {
      homerLine = homerLine.replace(/(<([^>]+)>)/ig,"");  // strip tags
      var homerLineClean = homerLine.split('RBI:');  // get rid of RBI part
      if (debug) console.log(homerLineClean[0]);
      var homerLineMulti = homerLineClean[0].split('); ');
      _.forEach(homerLineMulti, function(thishr) {
        thishr = thishr.trim();
        if (debug) console.log('>>', thishr);
        var nextHr = thishr.split(" ");
        var player = nextHr[0];
        if (debug) console.log('>>', player);
        var noHomeruns = 1;
        if (nextHr[1].substring(0,1) !== '(') {
          if (!scrapeTools.isNormalInteger(nextHr[1])) {
            player = player + ' ' + nextHr[1];
            if (nextHr[2].substring(0,1) !== '(') {
              if (!scrapeTools.isNormalInteger(nextHr[2])) {
                player = player + ' ' + nextHr[2];
              } else {
                noHomeruns = nextHr[2];
              }
            }
          } else {
            noHomeruns = nextHr[1];
          }
        }
        var homers = thishr.split('(');
        var homers2 = homers[1].split(',');
        var homerunNo = homers2[0];
        if (debug) console.log('>>', homerunNo);

        // Get player id
        var playerId;
        var playerBeforeAccents = player.trim();
        if (debug) console.log('>>before accents >>', playerBeforeAccents);
        player = scrapeTools.removeFirstInitial(playerBeforeAccents);
        player = scrapeTools.removeAccents(player);

        // Great now we have player name
        if (debug) console.log('>>after accents >>', player);

        // Go find the playerId
        let playerSearch1 = scrapeTools.advancedSplit(content, player + "</span");
        if (debug) console.log('>>>>> count on player search is: ', playerSearch1.length);
        if (playerSearch1.length > 5) {

          player = scrapeTools.removeAccents(playerBeforeAccents);
          if (debug) console.log('>>after accents with first initial >>', playerBeforeAccents);
          playerSearch1 = scrapeTools.advancedSplit(content, player + "</span");
          if (playerSearch1.length > 5) {
            var issueMessage = 'Cannot determine player id for: ' + player + ' in ' + gameBoxScore;
            if (debug) console.log(issueMessage);
            notify.sendSlack({
              channel: '#hr-update-issues',
              username: 'SAME LAST NAME ISSUE - HR NOT UPDATED',
              description: issueMessage
            });
            return;
          }
        }

        if (!playerSearch1) {
          var issueMessage = 'ISSUE 1: Cannot find player id for: ' + player + ' in ' + gameBoxScore;
          if (debug) console.log(issueMessage);
          notify.sendSlack({
            channel: '#hr-update-issues',
            username: 'POTENTIAL ISSUE 1',
            description: issueMessage
          });
        } else {
          let firstUp = playerSearch1[0].substr(-120);
          if (debug) console.log('Player id line info: ' + firstUp);
          let nextUp = firstUp.split('https://www.espn.com/mlb/player/_/id/');
          if (!nextUp[1]) {
            nextUp = firstUp.split('http://www.espn.com/mlb/player/_/id/');
          }
          if (!nextUp[1]) {
            let issueMessage = 'ISSUE 2: Cannot find player id for: ' + player + ' in ' + gameBoxScore;
            if (debug) console.log(issueMessage);
            notify.sendSlack({
              channel: '#hr-update-issues',
              username: 'POTENTIAL ISSUE 2',
              description: issueMessage
            });
          } else {
            let playerSearch2 = nextUp[1].split('"');
            if (!playerSearch2[0]) {
              let issueMessage = 'ISSUE 3: Cannot find player id for: ' + player + ' in ' + gameBoxScore;
              if (debug) console.log(issueMessage);
              notify.sendSlack({
                channel: '#hr-update-issues',
                username: 'CANNOT FIND PLAYER ID - HR NOT UPDATED',
                description: issueMessage
              });
            } else {
              let playerId = playerSearch2[0];
              if (debug) console.log('>>', playerId);

              if (debug) console.log('Homerun hit by:', player, homerunNo, noHomeruns, playerId);
              addHomerun(season, player, homerunNo, noHomeruns, playerId, dateHit);
            }
          }
        }
      });
    });
  }
}

function addHomerun(season, player, homerunNo, noHomeruns, playerId, date) {
  var espnUrl = 'https://www.espn.com/mlb/player/_/id/' + playerId;
  // Get the current team
  request(espnUrl)
    .then(function (htmlPlayer) {
      // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality
      var $ = cheerio.load(htmlPlayer);
      var title = $('title').text();
      var getTeam = title.split(' - ');
      var team = getTeam[1];

      playerLib.getPlayerByEspnId(playerId, (err, playerObj) => {
        if (err) {
          // do error
          let issueMessage = player + ' | ' + playerId + ' #' + homerunNo;
          if (debug) console.log('Err: ' + issueMessage + JSON.stringify(err));
          notify.sendSlack({
            channel: '#hr-update-issues',
            username: 'ISSUE finding player in our db',
            description: issueMessage
          });
        }
        if (playerObj) {
          let playerObjUpdated = playerLib.updatePlayerStats(playerObj, season, team, homerunNo, date);

          if (!playerObjUpdated) {
            let skipMsg = player + ' | ' + playerId + ' #' + homerunNo;
            if (debug) console.log('Stat exists -- Skip: ' + skipMsg);
          } else {
            if (debug) console.log('Sending to Sqs', player);
            sendToSqsUpdatePlayer(playerObjUpdated);

            if (debug) console.log('Saving player', player);
            playerLib.savePlayer(playerObjUpdated, (err, result) => {
              if (err) {
                let issueMessage = player + ' | ' + playerId + ' #' + homerunNo;
                if (debug) console.log('Err: ' + issueMessage + JSON.stringify(err));
                notify.sendSlack({
                  channel: '#hr-update-issues',
                  username: 'ISSUE saving player in our db',
                  description: issueMessage
                });
              } else {
                if (debug) console.log('Homerun saved: ' + player + ' #' + homerunNo);
                notify.sendSlack({
                  channel: '#hr-update',
                  username: 'HR added',
                  description: team + ': ' + player + ' #' + homerunNo + ' - ' + espnUrl
                });
              }
            });
          }
        } else {
          let issueMessage = player + ' | ' + playerId + ' #' + homerunNo;
          if (debug) console.log('Err: ' + issueMessage);
          notify.sendSlack({
            channel: '#hr-update-issues',
            username: 'ISSUE finding player in our db (no err)',
            description: issueMessage
          });
        }
      });
    })
    .catch(function (err) {
      console.error('[AddHomerunsScript] Failed to get player profile from ESPN');
      notify.sendSlack({
        channel: '#hr-update-issues',
        username: 'Player profile not found',
        description: player + ' : ' + playerId
      });
    });
}

function sendToSqsUpdatePlayer(playerObj) {
  let params = {
     MessageBody: JSON.stringify(playerObj),
     QueueUrl: 'https://sqs.us-west-2.amazonaws.com/576404071076/FHR-UpdateAllGames-dev'
  };

  var AWS = require('aws-sdk');
  var sqs = new AWS.SQS({
      region: 'us-west-2'
  });

  sqs.sendMessage(params, function(err, data) {
    if (err) {
      console.error("Failed to send message to update player" + err);
      notify.sendSlack({
        channel: '#hr-update-issues',
        username: 'Player not sent to SQS to update games',
        description: playerObj.displayName + ' : ' + playerObj.espnPlayerId
      });
    } else {
      if (debug) console.log('data:', data.MessageId);
    }
  });
}
