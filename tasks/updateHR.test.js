const updateHR = require('../../services/tasks/updateHR');
const assert = require('assert');
const expect = require('chai').expect;
const AWS = require('aws-sdk-mock');

describe('Homerun Update', () => {
  it('should open up webpage for date in past', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback){
      callback(null, { Item: { "pk": "test" } });
    });
    AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
      callback(null);
    });
    let event = { date: '20190801'};
    updateHR.update(event, {}, (err, result) => {
      try {
        expect(err).to.not.exist;
        // expect(result).to.exist;
        done();
      } catch(error) {
        done(error);
      }
    });
    AWS.restore('DynamoDB.DocumentClient');
  });

  it('should open up webpage for current date', (done) => {
    AWS.mock('DynamoDB.DocumentClient', 'get', function (params, callback){
      callback(null, { Item: { "pk": "test" } });
    });
    AWS.mock('DynamoDB.DocumentClient', 'put', function (params, callback){
      callback(null);
    });
    let event = {};
    updateHR.update(event, {}, (err, result) => {
      try {
        expect(err).to.not.exist;
        done();
      } catch(error) {
        done(error);
      }
    });
    AWS.restore('DynamoDB.DocumentClient');
  });
});
