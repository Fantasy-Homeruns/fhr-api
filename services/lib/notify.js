'use strict';

const env = process.env.NODE_ENV || 'development';
const slack = require('slack-notify')('https://fantasyhomeruns.slack.com/services/hooks/incoming-webhook?token=dcvhgmgtdMYc8nvtIMpyLBks');

let notify = {
  sendSlack(data) {
    if (env === 'test') {
      return true;
    }
    if (env !== 'production') {
      data.description = env.toUpperCase() + ': ' + data.description;
    }
    slack.send({
      channel: data.channel,
      icon_url: 'https://www.fantasyhomeruns.com/fhr-logo.png',
      text: data.description,
      unfurl_links: 1,
      username: data.username
    });
  }
};

module.exports = notify;
