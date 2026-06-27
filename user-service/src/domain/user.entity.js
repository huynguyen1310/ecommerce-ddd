class User {
  constructor(id, email, password, role, shopId, status, createdAt) {
    this.id = id;
    this.email = email;
    this.password = password;
    this.role = role || 'customer';
    this.shopId = shopId || null;
    this.status = status || 'active';
    this.createdAt = createdAt || null;
  }

}

module.exports = { User };
