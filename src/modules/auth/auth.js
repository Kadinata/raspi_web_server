//===========================================================================
//  
//===========================================================================
const bcrypt = require('bcrypt');
const passport_config = require('./auth_passport_config');
const jwt_signer = require('../jwt/jwt_signer');

const DEFAULT_SALT_ROUNDS = 10;

class Auth {

  constructor(user_model, jwt_secret, salt_rounds = DEFAULT_SALT_ROUNDS) {
    this._salt_rounds = salt_rounds;
    this._user_model = user_model;
    this.generateToken = jwt_signer(jwt_secret);
    passport_config.configure(this, jwt_secret);
  }

  async registerUser(username, password) {
    const user = await this._user_model.findByUserName(username);
    if (user !== null) return null;

    const hashed_password = await bcrypt.hash(password, this._salt_rounds);
    this._user_model.create(username, hashed_password);

    const new_user = await this._user_model.findByUserName(username);
    return this._user_model.sanitize(new_user);
  }

  async authenticateUser(username, password) {
    const user = await this._user_model.findByUserName(username);
    if (user === null) return null;

    const password_matched = await bcrypt.compare(password, user.password);
    return password_matched ? this._user_model.sanitize(user) : null;
  }

  async updateUserPassword(user_id, current_password, new_password) {

    const result = { user: null, error: null };

    if (!current_password || !new_password) {
      const message = 'Invalid parameters';
      return { ...result, error: { message } };
    }

    const user = await this._user_model.findById(user_id);
    if (user === null) {
      const message = 'User not found';
      return { ...result, error: { message } };
    }

    const password_matched = await bcrypt.compare(current_password, user.password);
    if (!password_matched) {
      const message = 'Incorrect password';
      return { ...result, error: { message } };
    };

    if (current_password == new_password) {
      const message = 'New password must not be the same as the current password';
      return { ...result, error: { message } };
    }

    const hashed_password = await bcrypt.hash(new_password, this._salt_rounds);
    try {
      this._user_model.updatePassword(user_id, hashed_password);
    } catch (err) {
      const message = 'Password update failed';
      return { ...result, error: { message } };
    }
    return { ...result, user: this._user_model.sanitize(user) };
  };

  async findUserById(user_id) {
    const user = await this._user_model.findById(user_id);
    return this._user_model.sanitize(user);
  }
}

module.exports = Auth;
//===========================================================================
