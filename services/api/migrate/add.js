'use strict';

const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies
const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.add = (event, context, callback) => {
  const payload = JSON.parse(event.body);
  const data = buildData(payload.data);

  dynamoDb.put(data, (error) => {
    if (error) {
      console.error(error);
      callback(null, {
        statusCode: error.statusCode || 501,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(error),
      });
      return;
    }

    const response = {
      statusCode: 201,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    };
    callback(null, response);
  });
};

const buildData = (data) => {
  return {
    TableName: process.env.FHR_TABLE,
    Item: data.attributes,
  };
};
