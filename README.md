# microauth-slack

> Slack oauth for [micro](https://github.com/zeit/micro/)

[![Build Status](https://travis-ci.org/microauth/microauth-slack.svg?branch=master)](https://travis-ci.org/microauth/microauth-slack)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Add [slack](https://slack.com) authentication to your [micro](https://github.com/zeit/micro/) service as easy as a flick of your fingers.
This module is a part of [microauth](https://github.com/microauth/microauth) collection.

## Installation

```sh
npm install --save microauth-slack
# or
yarn add microauth-slack
```

## Usage

app.js
```js
const { send } = require('micro');
const microAuthSlack = require('./index');

const options = {
  clientId: 'CLIENT_ID',
  clientSecret: 'CLIENT_SECRET',
  callbackUrl: 'http://localhost:3000/auth/slack/callback',
  path: '/auth/slack',
  scope: 'identity.basic,identity.team,identity.avatar'
};

const slackAuth = microAuthSlack(options);

// Third `auth` argument will provide error or result of authentication
// so it will { err: errorObject} or { result: {
//  provider: 'slack',
//  accessToken: 'blahblah',
//  info: userInfo
// }}
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

```

Run:
```sh
micro app.js
```

Now visit `http://localhost:3000/auth/slack`


## Author
[Artem Karpovich](https://github.com/artemkarpovich)
