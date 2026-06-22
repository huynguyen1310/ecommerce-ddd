const bcrypt = require('bcryptjs');
const { User } = require('../domain/user.entity');

class RegisterUseCase {
  constructor(userRepository) {
    this.userRepository = userRepository;
  }

  async execute(dto) {
    const existing = await this.userRepository.findByEmail(dto.email);
    if (existing) {
      const error = new Error('User already exists');
      error.code = 'EMAIL_TAKEN';
      throw error;
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = new User(null, dto.email, hashedPassword, 'customer');
    await this.userRepository.save(user);
    return { id: user.id, email: user.email, role: user.role };
  }
}

module.exports = { RegisterUseCase };
