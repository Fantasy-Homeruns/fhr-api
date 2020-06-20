'use strict';

const uuid = require('uuid');
const crypto = require('crypto');
const AWS = require('aws-sdk'); // eslint-disable-line import/no-extraneous-dependencies

const dynamoDb = new AWS.DynamoDB.DocumentClient();
const stripe = require('stripe')('sk_test_Fs1Ak7xIDrxbYtG9a3NKiLfV');

module.exports.create = (event, context, callback) => {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  // Validate
  let errors = {};
  if (!data.leagueName) errors.leagueName = 'League name is required';
  if (!data.firstName) errors.firstname = 'First name is required';
  if (!data.lastName) errors.lastName = 'Last name is required';
  if (!data.email) errors.email = 'Email is required';
  if (!data.password) errors.password = 'Password is required';

  if (Object.keys(errors).length > 0) {
    console.error('Error: Validation Failed');
    callback(null, {
      statusCode: 400,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errors),
    });
    return;
  }

  const amount = 1500;
  const name = data.firstName + " " + data.lastName;
  const description = "New League: " + data.leagueName;

  // Charge them first with Stripe
  stripe.customers.create({
    email: data.email,
    description: description,
    source: {
      object: "card",
      exp_month: data.expmon,
      exp_year: data.expyear,
      number: data.cc,
      cvc: data.csc,
      address_zip: data.zip,
      address_line1: data.address,
      name: name
    }
  }).then((customer) => {
    return stripe.charges.create({
      amount: amount,
      receipt_email: data.email,
      currency: 'usd',
      customer: customer.id,
      description: description
    });
  }).then((charge) => {
    // New charge created on a new customer
    console.log("Card processed successfully", charge.id);

    // TODO: Save transaction in the db

    // Create User first
    const userParams = generateUserParams(timestamp, data);
    dynamoDb.put(userParams, (error) => {
      if (error) {
        console.error(error);
        callback(null, {
          statusCode: error.statusCode || 501,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(error),
        });
        return;
      }

      // Create League
      const leagueParams = generateLeagueParams(timestamp, data, userParams.Item.id);
      dynamoDb.put(leagueParams, (error) => {
        if (error) {
          console.error(error);
        }
      });

      // Create Game

      // Create a response
      delete userParams.salt;
      delete userParams.password;

      const responseItems = {
        user: userParams,
        league: leagueParams
      };

      const response = {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(responseItems),
      };
      callback(null, response);
    });
  }).catch((err) => {
    console.error('Error in processing', err);
  });
};

const generateUserParams = (timestamp, data) => {
  const salt = uuid.v4();
  const password = crypto.createHash('sha256').update(salt + data.password).digest('base64');
  return {
    TableName: process.env.FHR_TABLE,
    Item: {
      id: "user-" + uuid.v1(),
      role: "commissioner",
      email: data.email,
      first_name: data.firstName,
      last_name: data.lastName,
      salt: salt,
      password: password,
      created_at: timestamp,
      updated_at: timestamp,
    },
  };
};

const generateLeagueParams = (timestamp, data, userId) => {
  return {
    TableName: process.env.FHR_TABLE,
    Item: {
      id: "league-" + uuid.v1(),
      name: data.leagueName,
      users: [
        {
          id: userId,
          role: "commissioner",
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
        }
      ],
      created_at: timestamp,
      updated_at: timestamp,
    },
  };
};
