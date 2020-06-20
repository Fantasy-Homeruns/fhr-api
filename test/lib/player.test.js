const player = require('../../services/lib/player');
const assert = require('assert');
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');

describe('Player', () => {
  it('should get player by espn player id', () => {
    AWS.mock('DynamoDB.DocumentClient', 'query', function (params, callback){
      callback(null, { Items: [{ "pk": "test", "data": "test" }] });
    });
    let id = 32080;
    player.getPlayerByEspnId(id, (err, result) => {
      expect(err).to.be.null;
      expect(result).to.exist;
    });
    AWS.restore('DynamoDB.DocumentClient');
  });

  it('should return error if missing espn player id', () => {
    AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback){
      callback(null, { Item: { "pk": "test", "data": "test" } });
    });
    let id;
    player.getPlayerByEspnId(id, (err, result) => {
      expect(err).to.exist;
      expect(result).to.be.null;
    });
    AWS.restore('DynamoDB.DocumentClient');
  });

  it('should update player stats for season and team if stat does not exist', () => {
    let playerObj = {
      "seasons": [
        {
          "hrTot": 0,
          "season": 2019,
          "teams": [
            {
              "team": "NYM",
              "stats": []
            }
          ]
        }
      ]
    };
    let result = player.updatePlayerStats(playerObj, 2019, "NYM", 1, "2018-09-02 09:00:00");

    let expectedResult = {
      "seasons": [
        {
          "hrTot": 1,
          "season": 2019,
          "teams": [
            {
              "team": "NYM",
              "stats": [
                {
                  "no": 1,
                  "date": "2018-09-02 09:00:00"
                }
              ]
            }
          ]
        }
      ]
    };
    expect(result).to.eql(expectedResult);
  });

  it('should not update player stats for season and team if stat does exist', () => {
    let playerObj = {
      "seasons": [
        {
          "hrTot": 1,
          "season": 2019,
          "teams": [
            {
              "team": "NYM",
              "stats": [
                {
                  "no": 1,
                  "date": "2018-09-02 09:00:00"
                }
              ]
            }
          ]
        }
      ]
    };
    let result = player.updatePlayerStats(playerObj, 2019, "NYM", 1, "2018-09-02 09:00:00");
    expect(result).to.be.false;
  });

  it('should save the player', () => {
    let playerObj = {
      "seasons": [
        {
          "hrTot": 1,
          "season": 2019,
          "teams": [
            {
              "team": "NYM",
              "stats": [
                {
                  "no": 1,
                  "date": "2018-09-02 09:00:00"
                }
              ]
            }
          ]
        }
      ]
    };
    AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
      callback(null, player);
    });
    player.savePlayer(playerObj, (err, result) => {
      expect(err).to.be.null;
      expect(result).to.eql(playerObj);
    });
    AWS.restore('DynamoDB.DocumentClient');
  });

  it('should return error if save of player fails', () => {
    AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
      callback({'error': 'test error'}, null);
    });
    let playerObj = {
      "seasons": [
        {
          "hrTot": 1,
          "season": 2019,
          "teams": [
            {
              "team": "NYM",
              "stats": [
                {
                  "no": 1,
                  "date": "2018-09-02 09:00:00"
                }
              ]
            }
          ]
        }
      ]
    };
    player.savePlayer(playerObj, (err, result) => {
      expect(err).to.eql({'error': 'test error'});
      expect(result).to.be.null;
    });
    AWS.restore('DynamoDB.DocumentClient');
  });

  it('should update all player stats', () => {
    let playerObj = {
      "seasons": [
        {
          "season": 2018,
          "hrTot": 0,
          "teams": [
            {
              "team": "NYM",
              "stats": [
                { "no": 1 },
                { "no": 2 }
              ]
            }
          ]
        },
        {
          "season": 2019,
          "hrTot": 0,
          "teams": [
            {
              "team": "NYM",
              "stats": [
                { "no": 1 },
                { "no": 2 },
                { "no": 3 }
              ]
            }
          ]
        }
      ]
    };

    let playerResult = {
      "seasons": [
        {
          "season": 2018,
          "hrTot": 2,
          "teams": [
            {
              "team": "NYM",
              "stats": [
                { "no": 1 },
                { "no": 2 }
              ]
            }
          ]
        },
        {
          "season": 2019,
          "hrTot": 3,
          "teams": [
            {
              "team": "NYM",
              "stats": [
                { "no": 1 },
                { "no": 2 },
                { "no": 3 }
              ]
            }
          ]
        }
      ]
    };
    let result = player.updateAllPlayerStats(playerObj);
    expect(result).to.eql(playerResult);
  });

});
