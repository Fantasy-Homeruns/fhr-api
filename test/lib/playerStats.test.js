const playerStats = require('../../services/lib/playerStats');
const assert = require('assert');
const expect = require('chai').expect;

describe('Player Stats', () => {
  it('should get player season with one season', () => {
    let season = 2019;
    let player = {
      "id": "player-004a0415-39be-4adc-b617-7b8eacb5ce97",
      "seasons": [
        {
          "season": 2019,
          "hrTot": 45
        }
      ]
    };
    let result = playerStats.getPlayerSeason(player, season);
    expect(result).to.eql({
      "season": 2019,
      "hrTot": 45
    });
  });

  it('should get player season with multiple seasons', () => {
    let season = 2019;
    let player = {
      "id": "player-004a0415-39be-4adc-b617-7b8eacb5ce97",
      "seasons": [
        {
          "season": 2018,
          "hrTot": 45
        },
        {
          "season": 2019,
          "hrTot": 45
        }
      ]
    };
    let result = playerStats.getPlayerSeason(player, season);
    expect(result).to.eql({
      "season": 2019,
      "hrTot": 45
    });
  });

  it('should return undefined if player season with no seasons', () => {
    let season = 2019;
    let player = {
      "id": "player-004a0415-39be-4adc-b617-7b8eacb5ce97",
      "seasons": []
    };
    let result = playerStats.getPlayerSeason(player, season);
    expect(result).to.be.undefined;
  });

  it('should return false if no seasons in player', () => {
    let season = 2019;
    let player = {
      "id": "player-004a0415-39be-4adc-b617-7b8eacb5ce97"
    };
    let result = playerStats.getPlayerSeason(player, season);
    expect(result).to.be.false;
  });

  it('should get player team by name', () => {
    let playerSeason = {
      "teams": [
        {
          "team": "New York Mets"
        },
        {
          "team": "Portland Champions"
        }
      ]
    };
    let result = playerStats.getPlayerTeam(playerSeason, "New York Mets");
    expect(result).to.eql({ "team": "New York Mets"});
  });

  it('should return no team if not found', () => {
    let playerSeason = { "teams": []};
    let result = playerStats.getPlayerTeam(playerSeason, "New York Mets");
    expect(result).to.be.undefined;
  });

  it('should add stat if no does not exist', () => {
    let stats = [
      {
        "no": 1,
        "date": "2018-09-01 09:00:00"
      }
    ];
    let expectedResult = [
      {
        "no": 1,
        "date": "2018-09-01 09:00:00"
      },
      {
        "no": 2,
        "date": "2018-09-02 09:00:00"
      }
    ];
    let result = playerStats.addStat(stats, 2, "2018-09-02 09:00:00");
    expect(result).to.be.eql(expectedResult);
  });

  it('should add stat if no does not exist (and no is a string)', () => {
    let stats = [
      {
        "no": 1,
        "date": "2018-09-01 09:00:00"
      }
    ];
    let expectedResult = [
      {
        "no": 1,
        "date": "2018-09-01 09:00:00"
      },
      {
        "no": 2,
        "date": "2018-09-02 09:00:00"
      }
    ];
    let result = playerStats.addStat(stats, "2", "2018-09-02 09:00:00");
    expect(result).to.be.eql(expectedResult);
  });

  it('should not add stat if no does exist', () => {
    let stats = [
      {
        "no": 1,
        "date": "2018-09-01 09:00:00"
      }
    ];
    let result = playerStats.addStat(stats, 1, "2018-09-02 09:00:00");
    expect(result).to.be.false;
  });

  it('calculate homerun total for player with one team', () => {
    let teams = [
      {
        "teamLeague": "NL",
        "stats": [
          {
            "no": 1,
            "date": "2018-09-01 09:00:00"
          },
          {
            "no": 2,
            "date": "2018-09-02 09:00:00"
          },
        ]
      }
    ];
    let total = playerStats.calculateHrTotal(teams);
    expect(total).to.equal(2);
  });

  it('calculate homerun total for player with more than one team in same league', () => {
    let teams = [
      {
        "teamLeague": "NL",
        "stats": [
          {
            "no": 1,
            "date": "2018-09-01 09:00:00"
          },
          {
            "no": 2,
            "date": "2018-09-02 09:00:00"
          },
        ]
      },
      {
        "teamLeague": "NL",
        "stats": [
          {
            "no": 3,
            "date": "2018-09-03 09:00:00"
          },
          {
            "no": 4,
            "date": "2018-09-04 09:00:00"
          },
        ]
      }
    ];
    let total = playerStats.calculateHrTotal(teams);
    expect(total).to.equal(4);
  });

  it('calculate homerun total for player with more than one team in different leagues', () => {
    let teams = [
      {
        "teamLeague": "NL",
        "stats": [
          {
            "no": 1,
            "date": "2018-09-01 09:00:00"
          },
          {
            "no": 2,
            "date": "2018-09-02 09:00:00"
          },
        ]
      },
      {
        "teamLeague": "AL",
        "stats": [
          {
            "no": 1,
            "date": "2018-09-03 09:00:00"
          },
          {
            "no": 2,
            "date": "2018-09-04 09:00:00"
          },
        ]
      }
    ];
    let total = playerStats.calculateHrTotal(teams);
    expect(total).to.equal(4);
  });

  it('calculate homerun total with no stats', () => {
    let teams = [
      {
        "teamLeague": "NL",
        "stats": []
      }
    ];
    let total = playerStats.calculateHrTotal(teams);
    expect(total).to.equal(0);
  });

  it('update homerun total for player season with one season', () => {
    let player = {
      "id": "player-004a0415-39be-4adc-b617-7b8eacb5ce97",
      "seasons": [
        {
          "season": 2019,
          "hrTot": 0
        }
      ]
    };
    let playerResult = {
      "id": "player-004a0415-39be-4adc-b617-7b8eacb5ce97",
      "seasons": [
        {
          "season": 2019,
          "hrTot": 23
        }
      ]
    };
    let result = playerStats.updateHrTotal(23, player, 2019);
    expect(result).to.eql(playerResult);
  });

  it('update homerun total for player season with many seasons', () => {
    let player = {
      "id": "player-004a0415-39be-4adc-b617-7b8eacb5ce97",
      "seasons": [
        {
          "season": 2019,
          "hrTot": 0
        },
        {
          "season": 2018,
          "hrTot": 0
        }
      ]
    };
    let playerResult = {
      "id": "player-004a0415-39be-4adc-b617-7b8eacb5ce97",
      "seasons": [
        {
          "season": 2019,
          "hrTot": 23
        },
        {
          "season": 2018,
          "hrTot": 0
        }
      ]
    };
    let result = playerStats.updateHrTotal(23, player, 2019);
    expect(result).to.eql(playerResult);
  });

  it('should return a player with only one season if multiple seasons exist', () => {
    let player = {
      "pk": "test",
      "seasons": [
        {
          "season": 2018,
          "hrTot": 20
        },
        {
          "season": 2019,
          "hrTot": 33
        }
      ]
    };
    let playerResult = {
      "pk": "test",
      "season": 2019,
      "hrTot": 33
    };
    let result = playerStats.getPlayerForOneSeason(player, 2019);
    expect(result).to.eql(playerResult);
  });

  it('should return a player with only one season if one season exists', () => {
    let player = {
      "pk": "test",
      "seasons": [
        {
          "season": 2019,
          "hrTot": 33
        }
      ]
    };
    let playerResult = {
      "pk": "test",
      "season": 2019,
      "hrTot": 33
    };
    let result = playerStats.getPlayerForOneSeason(player, 2019);
    expect(result).to.eql(playerResult);
  });

});
