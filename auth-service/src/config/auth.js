//const jwt = require('jsonwebtoken');
//const bcrypt = require('bcryptjs');

module.exports = {
  jwtSecret:
    process.env.JWT_SECRET || 'kTwjrRJki2jB16KxVj1BFygPyS2gfR3Pfw8Uc2i3C94=',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '1h',
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS) || 12,
};
