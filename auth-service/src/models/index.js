// models/index.js
const User = require('./User.model');
const AuthToken = require('./AuthToken.model');
const Session = require('./Session.model');

module.exports = {
  User,
  AuthToken,
  Session,
};
