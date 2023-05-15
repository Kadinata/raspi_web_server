//===========================================================================
//  
//===========================================================================
const jwt = require('jsonwebtoken');
const jwt_signer = require('../../../src/modules/jwt/jwt_signer');

describe("JWT Signer Tests", () => {

  const mock_jwt_secret = "This is a secret"

  it("should create JWT signer as a function", () => {
    const tokenSigner = jwt_signer(mock_jwt_secret);
    expect(typeof tokenSigner).toBe('function');
  });

  it("should sign token successfully", () => {
    const data = { test: "Test Data" };
    const expiresIn = 60 * 60;
    const expectedToken = jwt.sign(data, mock_jwt_secret, { expiresIn });
    const tokenSigner = jwt_signer(mock_jwt_secret);
    const token = tokenSigner(data, expiresIn);
    expect(token).toBe(expectedToken);
  });
});
//===========================================================================