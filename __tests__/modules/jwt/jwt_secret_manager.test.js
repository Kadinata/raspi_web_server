//===========================================================================
//  
//===========================================================================
const fsPromises = require('fs/promises');
const crypto = require('crypto');
const jwtsm = require('../../../src/modules/jwt/jwt_secret_manager');

const TEST_FILE_PATH = 'secret/path/to/jwt_secret.key';

const mock_crypto_random_bytes = jest.spyOn(crypto, 'randomBytes');

jest.mock('fs/promises', () => {
  const files = {};

  return ({
    readFile: jest.fn((path) => {
      if (files[path] === undefined) {
        throw new Error(`${path}: No such file exists`);
      }
      else {
        return files[path];
      }
    }),
    mkdir: jest.fn((path, opts) => null),
    writeFile: jest.fn((path, data) => {
      files[path] = ({
        toString: () => data,
      });
    }),
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('JWT Secret Manager Tests', () => {
  it('should generate a secret and create a secret file if none exists', async () => {
    expect(fsPromises.readFile).toHaveBeenCalledTimes(0);
    expect(fsPromises.mkdir).toHaveBeenCalledTimes(0);
    expect(fsPromises.writeFile).toHaveBeenCalledTimes(0);
    expect(mock_crypto_random_bytes).toHaveBeenCalledTimes(0);

    const secret_1 = await jwtsm.load_or_create(TEST_FILE_PATH);
    expect(fsPromises.readFile).toHaveBeenCalledTimes(1);
    expect(fsPromises.mkdir).toHaveBeenCalledTimes(1);
    expect(fsPromises.writeFile).toHaveBeenCalledTimes(1);
    expect(fsPromises.writeFile).toHaveBeenCalledWith(TEST_FILE_PATH, secret_1);
    expect(mock_crypto_random_bytes).toHaveBeenCalledTimes(1);

    const secret_2 = await jwtsm.load_or_create(TEST_FILE_PATH);
    expect(fsPromises.readFile).toHaveBeenCalledTimes(2);
    expect(fsPromises.mkdir).toHaveBeenCalledTimes(1);
    expect(fsPromises.writeFile).toHaveBeenCalledTimes(1);
    expect(mock_crypto_random_bytes).toHaveBeenCalledTimes(1);
    expect(secret_2).toEqual(secret_1);
  });
});

//===========================================================================