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

    const token = this.jwtProvider.sign({ id: user.id, email: user.email, role: user.role });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }
}

module.exports = { LoginUseCase };
