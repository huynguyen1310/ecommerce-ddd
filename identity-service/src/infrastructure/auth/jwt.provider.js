const jwt = require('jsonwebtoken');

class JwtProvider {
  constructor(secret) {
    this.secret = secret;
  }

  sign(payload) {
    return jwt.sign(payload, this.secret);
  }
}

module.exports = { JwtProvider };
