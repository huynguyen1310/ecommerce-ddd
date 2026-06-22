const { User } = require('../../domain/user.entity');

class UserMapper {
  static toDomain(row) {
    if (!row) return null;
    return new User(row.id, row.email, row.password, row.role);
  }

  static toPersistence(user) {
    return {
      id: user.id,
      email: user.email,
      password: user.password,
      role: user.role,
    };
  }
}

module.exports = { UserMapper };
