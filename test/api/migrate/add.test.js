const migrate = require('../../../services/api/migrate/add');
const assert = require('assert');
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');

describe.skip('Migrate', () => {
  it('should build data to import', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
      callback(null);
    });
    let data = JSON.stringify({"data": {"attributes": {"test": "abc"}}});
    let event = { "body": data };

    migrate.add(event, {}, (err, result) => {
      try {
        expect(err).to.not.exist;
        expect(result).to.exist;
        expect(result.statusCode).to.equal(201);
        done();
      } catch(error) {
        done(error);
      }
    });
    AWS.restore('DynamoDB.DocumentClient');
  });
});
