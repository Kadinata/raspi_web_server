//===========================================================================
//  
//===========================================================================
const protectedRoute = require('../../src/middlewares/auth/protected_route');
const Errors = require('../../src/common/status_codes/error_codes');

const MOCK_USER = { username: 'someUser' };

const create_req_res_next = () => ({
  req: {},
  res: {},
  next: jest.fn(() => null),
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Route Authentication Protection', () => {
  describe('When a valid user is authenticated', () => {
    it ('should call the next handler in the stack without an error', () => {
      const {req, res, next} = create_req_res_next();
      req.user = MOCK_USER;

      expect(next).toHaveBeenCalledTimes(0);
      protectedRoute(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0] instanceof Errors.GenericError).toEqual(false);
    });
  });

  describe('When no valid user is authenticated', () => {
    it ('should call the next handler in the stack with error', () => {
      const {req, res, next} = create_req_res_next();

      expect(next).toHaveBeenCalledTimes(0);
      protectedRoute(req, res, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(next.mock.calls[0][0] instanceof Errors.GenericError).toEqual(true);
    });
  });
});
//===========================================================================