const { User } = require('./user.entity');

describe('User', () => {
  it('creates user with role defaulting to customer', () => {
    const user = new User('u1', 'a@b.com', 'hashed');
    expect(user.role).toBe('customer');
  });

  it('creates user with specified role', () => {
    const user = new User('u1', 'a@b.com', 'hashed', 'admin');
    expect(user.role).toBe('admin');
  });

  it('isAdmin returns true for admin role', () => {
    const user = new User('u1', 'a@b.com', 'hashed', 'admin');
    expect(user.isAdmin()).toBe(true);
  });

  it('isAdmin returns false for customer role', () => {
    const user = new User('u1', 'a@b.com', 'hashed', 'customer');
    expect(user.isAdmin()).toBe(false);
  });

  it('isAdmin returns false for default role', () => {
    const user = new User('u1', 'a@b.com', 'hashed');
    expect(user.isAdmin()).toBe(false);
  });
});
