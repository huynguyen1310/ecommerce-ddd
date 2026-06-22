const { UserMapper } = require('./user.mapper');
const { User } = require('../../domain/user.entity');

describe('UserMapper', () => {
  it('toDomain returns null for null input', () => {
    expect(UserMapper.toDomain(null)).toBeNull();
  });

  it('toDomain maps row to User', () => {
    const user = UserMapper.toDomain({ id: 'u1', email: 'a@b.com', password: 'hash', role: 'admin' });
    expect(user).toBeInstanceOf(User);
    expect(user.id).toBe('u1');
    expect(user.email).toBe('a@b.com');
    expect(user.password).toBe('hash');
    expect(user.role).toBe('admin');
  });

  it('toDomain defaults role when missing', () => {
    const user = UserMapper.toDomain({ id: 'u1', email: 'a@b.com', password: 'hash' });
    expect(user.role).toBe('customer');
  });

  it('toPersistence converts User to plain object', () => {
    const user = new User('u1', 'a@b.com', 'hash', 'customer');
    const data = UserMapper.toPersistence(user);
    expect(data).toEqual({ id: 'u1', email: 'a@b.com', password: 'hash', role: 'customer' });
  });
});
