const bcrypt = require('bcryptjs');
const { RegisterUseCase } = require('./register.use-case');

jest.mock('bcryptjs');

describe('RegisterUseCase', () => {
  let useCase;
  let mockRepo;

  beforeEach(() => {
    mockRepo = { findByEmail: jest.fn(), save: jest.fn() };
    useCase = new RegisterUseCase(mockRepo);
    bcrypt.hash.mockResolvedValue('hashed-password');
  });

  it('registers new user', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute({ email: 'new@test.com', password: 'pass123' });

    expect(result.email).toBe('new@test.com');
    expect(result.role).toBe('customer');
    expect(result.id).toBeNull();
    expect(mockRepo.save).toHaveBeenCalledTimes(1);
    expect(bcrypt.hash).toHaveBeenCalledWith('pass123', 10);
  });

  it('throws EMAIL_TAKEN when email exists', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: 'existing', email: 'dup@test.com' });

    await expect(
      useCase.execute({ email: 'dup@test.com', password: 'pass' }),
    ).rejects.toThrow('User already exists');

    await expect(
      useCase.execute({ email: 'dup@test.com', password: 'pass' }),
    ).rejects.toMatchObject({ code: 'EMAIL_TAKEN' });

    expect(mockRepo.save).not.toHaveBeenCalled();
  });

  it('passes email to findByEmail', async () => {
    mockRepo.findByEmail.mockResolvedValue(null);

    await useCase.execute({ email: 'check@test.com', password: 'pass' });

    expect(mockRepo.findByEmail).toHaveBeenCalledWith('check@test.com');
  });
});
