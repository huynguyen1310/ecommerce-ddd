class User {
  constructor(id, email, password, role) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role || 'customer';
  }

}

module.exports = { User };
