const { send } = require('micro');
const microAuthSlack = require('.');

const options = {
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  callbackUrl: 'http://localhost:3000/auth/slack/callback',
  path: '/auth/slack',
  scope: 'identity.basic,identity.team,identity.avatar'
};

const slackAuth = microAuthSlack(options);

const handler = async (req, res, auth) => {

  if (!auth) {
    return send(res, 404, 'Not Found');
  }

  if (auth.err) {
    // Error handler
    console.error(auth.err);
    return send(res, 403, 'Forbidden');
  }

  // Save something in database here

  return `Hello ${auth.result.info.user.name}`;

};

module.exports = slackAuth(handler);
