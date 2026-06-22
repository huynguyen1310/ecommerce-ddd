class User {
  constructor(id, email, password, role) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role || 'customer';
  }

  isAdmin() {
    return this.role === 'admin';
  }
}

module.exports = { User };
