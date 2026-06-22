/**
 * @interface IJwtProvider
 *
 * Contract for JWT signing.
 * Implementations: JwtProvider
 */

class IJwtProvider {
  /** @param {object} payload @returns {string} */
  sign(payload) { throw new Error('Not implemented'); }
}

module.exports = { IJwtProvider };
