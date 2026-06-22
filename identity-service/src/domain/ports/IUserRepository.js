/**
 * @interface IUserRepository
 *
 * Contract for user persistence.
 * Implementations: PgUserRepository
 */

class IUserRepository {
  /** @returns {Promise<object|null>} */
  async findByEmail(email) { throw new Error('Not implemented'); }

  /** @returns {Promise<void>} */
  async save(user) { throw new Error('Not implemented'); }
}

module.exports = { IUserRepository };
