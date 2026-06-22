const jwt = require('jsonwebtoken');
const { isPublic, authMiddleware } = require('./gateway');

describe('isPublic', () => {
  it('returns true for POST /login', () => {
    expect(isPublic({ method: 'POST', path: '/login' })).toBe(true);
  });

  it('returns true for POST /register', () => {
    expect(isPublic({ method: 'POST', path: '/register' })).toBe(true);
  });

  it('returns true for GET /api/products', () => {
    expect(isPublic({ method: 'GET', path: '/api/products' })).toBe(true);
  });

  it('returns true for GET /api/products/something', () => {
    expect(isPublic({ method: 'GET', path: '/api/products/p1' })).toBe(true);
  });

  it('returns true for GET /products/something/reviews', () => {
    expect(isPublic({ method: 'GET', path: '/products/p1/reviews' })).toBe(true);
  });

  it('returns false for POST /orders', () => {
    expect(isPublic({ method: 'POST', path: '/orders' })).toBe(false);
  });

  it('returns false for GET /orders/customer/123', () => {
    expect(isPublic({ method: 'GET', path: '/orders/customer/123' })).toBe(false);
  });

  it('returns false for POST /payments', () => {
    expect(isPublic({ method: 'POST', path: '/payments/o1/process' })).toBe(false);
  });

  it('returns false for non-public GET path', () => {
    expect(isPublic({ method: 'GET', path: '/shipments/o1' })).toBe(false);
  });
});

describe('authMiddleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'secret';
  let req, res, next;

  beforeEach(() => {
    req = { headers: {} };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    next = jest.fn();
  });

  it('calls next for valid token', () => {
    const token = jwt.sign({ id: 'u1', email: 'a@b.com', role: 'admin' }, JWT_SECRET);
    req.headers.authorization = `Bearer ${token}`;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toMatchObject({ id: 'u1', email: 'a@b.com', role: 'admin' });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('returns 401 when no auth header', () => {
    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 when header is not Bearer', () => {
    req.headers.authorization = 'Basic somehash';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('returns 401 for invalid token', () => {
    req.headers.authorization = 'Bearer invalid-token';

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    expect(next).not.toHaveBeenCalled();
  });
});
