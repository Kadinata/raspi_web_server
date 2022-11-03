//===========================================================================
//  
//===========================================================================
const crypto = require('crypto');
const fsPromises = require('fs/promises');
const path = require('path');

const DEFAULT_SECRET_SIZE = 64;

const generate_jwt_secret = (size) => {
  return crypto.randomBytes(size).toString('base64url');
};

const load_or_create = async (filepath) => {
  try {
    const secret = await fsPromises.readFile(filepath);
    return secret.toString();
  } catch (err) {
    const secret = generate_jwt_secret(DEFAULT_SECRET_SIZE);
    const dirpath = path.dirname(filepath);
    await fsPromises.mkdir(dirpath, { recursive: true });
    await fsPromises.writeFile(filepath, secret);
    return secret;
  }
};

module.exports = { load_or_create };
//===========================================================================