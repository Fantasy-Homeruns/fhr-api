const updateAllGames = require('../../services/tasks/updateAllGames');
const assert = require('assert');
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');

describe('Game Update', () => {
  it('should receive player and update game', (done) => {
    let event = {
      "records": [
        {
          "body": {
            "player": "Billy Joe Robidoux"
          }
        }
      ]
    };
    updateAllGames.update(event, {}, (err, result) => {
      try {
        expect(err).to.not.exist;
        expect(result.statusCode).to.equal(200);
        done();
      } catch(error) {
        done(error);
      }
    });

  });
});
