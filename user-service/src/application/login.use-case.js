const bcrypt = require('bcryptjs');

class LoginUseCase {
  constructor(userRepository, jwtProvider) {
    this.userRepository = userRepository;
    this.jwtProvider = jwtProvider;
  }

  async execute(dto) {
    const user = await this.userRepository.findByEmail(dto.email);
    if (!user) {
      const error = new Error('Invalid credentials');
      error.code = 'AUTH_FAILED';
      throw error;
    }

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) {
      const error = new Error('Invalid credentials');
      error.code = 'AUTH_FAILED';
      throw error;
    }

    if (user.status === 'suspended') {
      const error = new Error('Account suspended');
      error.code = 'AUTH_FAILED';
      throw error;
    }

    const shopId = user.shopId || null;
    const token = this.jwtProvider.sign({ id: user.id, email: user.email, role: user.role, shopId, status: user.status });
    return { token, user: { id: user.id, email: user.email, role: user.role, shopId } };
  }
}

module.exports = { LoginUseCase };
