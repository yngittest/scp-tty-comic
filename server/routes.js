/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

import basicAuth from 'basic-auth-connect';

export default function(app) {
  // Add Basic Auth
  // const basicAuth = require('basic-auth-connect');
  const username = process.env.BASIC_AUTH_USERNAME;
  const password = process.env.BASIC_AUTH_PASSWORD;
  if(username && password) {
    app.use(basicAuth(username, password));
  }

  // Insert routes below
  app.use('/api/cart', require('./api/cart'));
  app.use('/api/banners', require('./api/banner'));
  app.use('/api/vols', require('./api/vol'));
  app.use('/api/comics', require('./api/comic'));
  app.use('/api/historys', require('./api/history'));
  app.use('/api/things', require('./api/thing'));
  app.use('/api/users', require('./api/user'));

  app.use('/auth', require('./auth').default);

  // All undefined asset or api routes should return a 404
  app.route('/:url(api|auth|components|app|bower_components|assets)/*')
   .get(errors[404]);

  // All other routes should redirect to the index.html
  app.route('/*')
    .get((req, res) => {
      res.sendFile(path.resolve(`${app.get('appPath')}/index.html`));
    });
}
