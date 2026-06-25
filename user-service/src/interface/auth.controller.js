class AuthController {
  constructor(registerUseCase, loginUseCase) {
    this.registerUseCase = registerUseCase;
    this.loginUseCase = loginUseCase;
  }

  async register(req, res) {
    const dto = { email: req.body.email, password: req.body.password };
    try {
      const result = await this.registerUseCase.execute(dto);
      res.status(201).json(result);
    } catch (err) {
      if (err.code === 'EMAIL_TAKEN') {
        return res.status(400).json({ error: 'User already exists' });
      }
      console.error('Registration error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  async login(req, res) {
    const dto = { email: req.body.email, password: req.body.password };
    try {
      const result = await this.loginUseCase.execute(dto);
      res.json(result);
    } catch (err) {
      if (err.code === 'AUTH_FAILED') {
        return res.status(401).json({ error: 'Invalid credentials' });
      }
      console.error('Login error:', err.message);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}

module.exports = { AuthController };
