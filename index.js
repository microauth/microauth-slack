const querystring = require('querystring');
const url = require('url');

const uuid = require('uuid');
const rp = require('request-promise');
const redirect = require('micro-redirect');

const provider = 'slack';

const microAuthSlack = ({ clientId, clientSecret, callbackUrl, path = '/auth/slack', scope = 'identity.basic' }) => {
  const getRedirectUrl = state => {
    return `https://slack.com/oauth/authorize?client_id=${clientId}&redirect_uri=${callbackUrl}&scope=${scope}&state=${state}`;
  };

  const states = [];

  return fn => async (req, res, ...args) => {
    const { pathname, query } = url.parse(req.url);

    if (pathname === path) {
      try {
        const state = uuid.v4();
        const redirectUrl = getRedirectUrl(state);
        states.push(state);
        return redirect(res, 302, redirectUrl);
      } catch (err) {
        args.push({ err, provider });
        return fn(req, res, ...args);
      }
    }

    const callbackPath = url.parse(callbackUrl).pathname;
    if (pathname === callbackPath) {
      try {
        const { state, code } = querystring.parse(query);

        if (!states.includes(state)) {
          const err = new Error('Invalid state');
          args.push({ err, provider });
          return fn(req, res, ...args);
        }

        states.splice(states.indexOf(state), 1);

        const response = await rp({
          url: 'https://slack.com/api/oauth.access',
          qs: {
            // eslint-disable-next-line camelcase
            client_id: clientId,
            // eslint-disable-next-line camelcase
            client_secret: clientSecret,
            code
          },
          json: true
        });

        if (response.error) {
          args.push({ err: response.error, provider });
          return fn(req, res, ...args);
        }

        const accessToken = response.access_token;

        const user = await rp({
          url: 'https://slack.com/api/users.identity',
          qs: {
            token: accessToken
          },
          json: true
        });

        const result = {
          provider,
          accessToken,
          info: user
        };

        args.push({ result });
        return fn(req, res, ...args);
      } catch (err) {
        args.push({ err, provider });
        return fn(req, res, ...args);
      }
    }

    return fn(req, res, ...args)
  }
};

module.exports = microAuthSlack;
