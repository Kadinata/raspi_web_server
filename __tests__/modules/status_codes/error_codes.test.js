//===========================================================================
//  
//===========================================================================
const Errors = require('../../../src/modules/status_codes/error_codes');

const TEST_ERROR_MESSAGE = 'Test error message';

describe('Error Codes Tests', () => {
  it('should initialize error objects correctly', () => {
    const badRequestError = new Errors.BadRequest(TEST_ERROR_MESSAGE);
    const unauthorizedError = new Errors.Unauthorized(TEST_ERROR_MESSAGE);
    const forbiddenError = new Errors.Forbidden(TEST_ERROR_MESSAGE);
    const notFoundError = new Errors.NotFound(TEST_ERROR_MESSAGE);
    const internalServerError = new Errors.InternalServerError(TEST_ERROR_MESSAGE);
    const customError = new Errors.GenericError(TEST_ERROR_MESSAGE, 418);

    expect(badRequestError instanceof Error).toEqual(true);
    expect(unauthorizedError instanceof Error).toEqual(true);
    expect(forbiddenError instanceof Error).toEqual(true);
    expect(notFoundError instanceof Error).toEqual(true);
    expect(internalServerError instanceof Error).toEqual(true);
    expect(customError instanceof Error).toEqual(true);

    expect(badRequestError.status).toEqual(400);
    expect(unauthorizedError.status).toEqual(401);
    expect(forbiddenError.status).toEqual(403);
    expect(notFoundError.status).toEqual(404);
    expect(internalServerError.status).toEqual(500);
    expect(customError.status).toEqual(418);

    expect(badRequestError.message).toEqual(TEST_ERROR_MESSAGE);
    expect(unauthorizedError.message).toEqual(TEST_ERROR_MESSAGE);
    expect(forbiddenError.message).toEqual(TEST_ERROR_MESSAGE);
    expect(notFoundError.message).toEqual(TEST_ERROR_MESSAGE);
    expect(internalServerError.message).toEqual(TEST_ERROR_MESSAGE);
    expect(customError.message).toEqual(TEST_ERROR_MESSAGE);
  });
});
//===========================================================================