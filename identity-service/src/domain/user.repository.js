/**
 * @interface UserRepository
 *
 * Contract for user persistence.
 * Implementations: PgUserRepository
 */

class UserRepository {
  async findByEmail(email) { throw new Error('Not implemented'); }
  async save(user) { throw new Error('Not implemented'); }
}

module.exports = { UserRepository };
