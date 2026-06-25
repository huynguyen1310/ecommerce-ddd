class User {
  constructor(id, email, password, role, shopId) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role || 'customer';
    this.shopId = shopId || null;
  }

}

module.exports = { User };
