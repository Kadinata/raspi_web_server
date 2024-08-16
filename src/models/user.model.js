//===========================================================================
//  
//===========================================================================
const { DataTypes, Sequelize } = require('sequelize');

const _ERR_MSG_USER_NOT_FOUND = 'Unable to find user with the provided user ID';

const fields = {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  username: {
    type: DataTypes.STRING(500),
    allowNull: false,
    unique: true,
  },

  password: {
    type: DataTypes.STRING(500),
    allowNull: false,
  },

  created: {
    type: 'TIMESTAMP',
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    allowNull: false,
  },
};

const options = {
  createdAt: false,
  updatedAt: false,
  modelName: 'user',
};

class User extends Sequelize.Model {

  static initialize(sequelize) {
    User.init(fields, { ...options, sequelize });
  }

  /**
   * (async) Query the database for a user with the provided user ID.
   * @param {String} user_id - ID of the user to find
   * @returns {Promise} - A promise containing the user data on success,
   * a promise containing null if the user is not found, otherwise an error.
   */
  static async findById(user_id) {
    return await User.findOne({ where: { id: user_id } });
  }

  /**
   * (async) Query the database for a user with the provided username.
   * @param {String} username - Username of the user to find.
   * @returns {Promise} - A promise containing the user data on success,
   * a promise containing null if the user is not found, otherwise an error.
   */
  static async findByUserName(username) {
    return await User.findOne({ where: { username } });
  }

  /**
   * (async) Check whether a user with the provided ID exists in the database.
   * @param {String} user_id - ID of the user to find
   * @returns {Promise} - A promise resolving true if the user exists,
   * false if the user does not exists, or appropriate error code.
   */
  static async exists(user_id) {
    const user = await User.findById(user_id);
    return user !== null;
  }

  /**
   * (async) Update the password of the user with the given user ID.
   * @param {String} user_id - ID of the user whose password to update
   * @param {String} new_password - Hash of the user's new password
   * @returns {Promise} - A void promise if successful, otherwise an error.
   * 
   * @warning Do NOT store raw passwords when creating new users.
   */
  static async updatePassword(user_id, new_password) {
    await User.update(
      { password: new_password },
      { where: { id: user_id } }
    );
  }

  /**
   * (async) Delete a user from the database.
   * @param {String} user_id - ID of the user to be deleted
   * @returns {Promise} - A void promise if successful, otherwise an error.
   */
  static async deleteUser(user_id) {
    const user_exists = await User.exists(user_id);
    if (!user_exists) {
      return Promise.reject(new Error(_ERR_MSG_USER_NOT_FOUND));
    }

    User.destroy({ where: { id: user_id } });
    return Promise.resolve(true);
  }

  /**
   * Remove sensitive information from the provided user data, such as password hash.
   * @returns {Object} Sanitized user data.
   */
  sanitize() {
    return {
      id: this.id,
      username: this.username,
      created: this.created,
    };
  }
};

module.exports = { User };
//===========================================================================