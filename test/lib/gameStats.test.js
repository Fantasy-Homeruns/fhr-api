const gameStats = require('../../services/lib/gameStats');
const assert = require('assert');
const expect = require('chai').expect;

describe('Game Stats', () => {
  it('should find and update one player in a game', () => {
    let player = {
      "pk": "player-104a0415-39be-4adc-b617-7b8eacb5ce92",
      "sk": "104a0415-39be-4adc-b617-7b8eacb5ce92",
      "seasons": [
        {
          "season": 2018,
          "hrTot": "45"
        }
      ]
    };

    let game = {
      "teams": [
        {
          "picks": [
            {
              "playerId": "104a0415-39be-4adc-b617-7b8eacb5ce92",
              "player": {
                "pk": "player-104a0415-39be-4adc-b617-7b8eacb5ce92",
                "sk": "104a0415-39be-4adc-b617-7b8eacb5ce92",
                "seasons": []
              }
            }
          ]
        }
      ]
    };

    let expectedResult = {
      "teams": [
        {
          "picks": [
            {
              "playerId": "104a0415-39be-4adc-b617-7b8eacb5ce92",
              "player": {
                "pk": "player-104a0415-39be-4adc-b617-7b8eacb5ce92",
                "sk": "104a0415-39be-4adc-b617-7b8eacb5ce92",
                "seasons": [
                  {
                    "season": 2018,
                    "hrTot": "45"
                  }
                ]
              }
            }
          ]
        }
      ]
    };
    let result = gameStats.findAndUpdatePlayer(player, game);
    expect(result).to.eql(expectedResult);
  });

  it('should not find and update one player in a game', () => {
    let player = {
      "pk": "player-104a0415-39be-4adc-b617-7b8eacb5ce92",
      "sk": "104a0415-39be-4adc-b617-7b8eacb5ce92",
      "seasons": [
        {
          "season": 2018,
          "hrTot": "45"
        }
      ]
    };

    let game = {
      "teams": [
        {
          "picks": [
            {
              "playerId": "904a0415-39be-4adc-b617-7b8eacb5ce92",
              "player": {
                "pk": "player-904a0415-39be-4adc-b617-7b8eacb5ce92",
                "sk": "904a0415-39be-4adc-b617-7b8eacb5ce92",
                "seasons": []
              }
            }
          ]
        }
      ]
    };
    let result = gameStats.findAndUpdatePlayer(player, game);
    expect(result).to.be.false;
  });

  it('should not find and update one player in a game (no picks)', () => {
    let player = {
      "pk": "player-104a0415-39be-4adc-b617-7b8eacb5ce92",
      "sk": "104a0415-39be-4adc-b617-7b8eacb5ce92",
      "seasons": [
        {
          "season": 2018,
          "hrTot": "45"
        }
      ]
    };

    let game = {
      "teams": [
        {
          "picks": []
        }
      ]
    };
    let result = gameStats.findAndUpdatePlayer(player, game);
    expect(result).to.be.false;
  });

  it('should calculate hr totals for game for all picks', () => {
    let game = {
      "teams": [
        {
          "hrTot": 0,
          "picks": [
            { "player": { "hrTot": 5 } },
            { "player": { "hrTot": 7 } },
            { "player": { "hrTot": 22 } },
          ]
        }
      ]
    };
    let gameResult = {
      "teams": [
        {
          "hrTot": 34,
          "picks": [
            { "player": { "hrTot": 5 } },
            { "player": { "hrTot": 7 } },
            { "player": { "hrTot": 22 } },
          ]
        }
      ]
    };
    let result = gameStats.calculateTotals(game);
    expect(result).to.eql(gameResult);

  });

});
