const jwt = require('jsonwebtoken');

/** @implements {import('../../domain/ports/IJwtProvider').IJwtProvider} */
class JwtProvider {
  constructor(secret) {
    this.secret = secret;
  }

  sign(payload) {
    return jwt.sign(payload, this.secret);
  }
}

module.exports = { JwtProvider };
