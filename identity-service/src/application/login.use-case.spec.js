const bcrypt = require('bcryptjs');
const { LoginUseCase } = require('./login.use-case');

jest.mock('bcryptjs');

describe('LoginUseCase', () => {
  let useCase;
  let mockRepo;
  let mockJwt;

  beforeEach(() => {
    mockRepo = { findByEmail: jest.fn() };
    mockJwt = { sign: jest.fn() };
    useCase = new LoginUseCase(mockRepo, mockJwt);
    bcrypt.compare.mockResolvedValue(true);
  });

  it('returns token and user on valid login', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', password: 'hash', role: 'customer' });
    mockJwt.sign.mockReturnValue('jwt-token');

    const result = await useCase.execute({ email: 'a@b.com', password: 'pass' });

    expect(result.token).toBe('jwt-token');
    expect(result.user).toEqual({ id: 'u1', email: 'a@b.com', role: 'customer' });
    expect(mockJwt.sign).toHaveBeenCalledWith({ id: 'u1', email: 'a@b.com', role: 'customer' });
  });

  it('throws AUTH_FAILED when user not found', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    await expect(
      useCase.execute({ email: 'nobody@test.com', password: 'pass' }),
    ).rejects.toMatchObject({ code: 'AUTH_FAILED' });
  });

  it('throws AUTH_FAILED when password wrong', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: 'u1', email: 'a@b.com', password: 'hash', role: 'customer' });
    bcrypt.compare.mockResolvedValue(false);

    await expect(
      useCase.execute({ email: 'a@b.com', password: 'wrong' }),
    ).rejects.toMatchObject({ code: 'AUTH_FAILED' });

    expect(mockJwt.sign).not.toHaveBeenCalled();
  });
});
