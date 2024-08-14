//===========================================================================
//  
//===========================================================================
const logger = require('../../common/logger').getLogger('USERS');

const _ERR_MSG_DB_HANDLE_IS_NULL = 'Unable to create user table because the database handle is null';
const _ERR_MSG_USER_NOT_FOUND = 'Unable to find user with the provided user ID';

class User {

  /**
   * Object constructor
   * @param {Database} database_handle - Instance of the database containing the user model.
   */
  constructor(database_handle) {
    this.db_handle = database_handle;
  }

  /**
   * (async) Initializes the user model instance. 
   * This will create a user table in the database if it does not exist.
   * @returns {Promise} - A void promise if successful, otherwise an error.
   */
  async init() {
    if (this.db_handle === null) return Promise.reject(new Error(_ERR_MSG_DB_HANDLE_IS_NULL));

    const sql_command = (
      "CREATE TABLE IF NOT EXISTS users (\
        id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,\
        username VARCHAR(500) NOT NULL,\
        password VARCHAR(500) NOT NULL,\
        created TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL\
      )"
    );

    try {
      await this.db_handle.run(sql_command);
      logger.info('User table created');
    } catch (err) {
      logger.error(`An error occurred while creating a user table: ${err}`);
      throw err;
    }
  }

  /**
   * (async) Insert a new user to the database.
   * @param {String} username - The user's username
   * @param {String} password - The user's password hash
   * @returns {Promise} - A void promise if successful, otherwise an error.
   * 
   * @warning Do NOT store raw passwords when creating new users.
   */
  async create(username, password) {
    if (this.db_handle === null) return Promise.reject(new Error(_ERR_MSG_DB_HANDLE_IS_NULL));
    const sql_command = (
      "INSERT INTO users(username, password)\
      VALUES($username, $password)"
    );
    const sql_params = {
      $username: username,
      $password: password,
    };
    try {
      await this.db_handle.run(sql_command, sql_params);
      logger.info(`User created; username: ${username}`);
    } catch (err) {
      logger.error(`An error occurred while creating user ${username}: ${err}`);
      throw err;
    }
  }

  /**
   * (async) Query the database for a user with the provided user ID.
   * @param {String} user_id - ID of the user to find
   * @returns {Promise} - A promise containing the user data on success,
   * a promise containing null if the user is not found, otherwise an error.
   */
  async findById(user_id) {
    if (this.db_handle === null) return Promise.reject(new Error(_ERR_MSG_DB_HANDLE_IS_NULL));
    const sql_command = (
      "SELECT id id, username username, password password, created created\
      FROM users WHERE id = $id"
    );

    const sql_params = { $id: user_id };
    try {
      const user = await this.db_handle.get(sql_command, sql_params);
      return user;
    } catch (err) {
      logger.error(`An error occurred while finding user by ID: ${user_id}; error: ${err}`);
      throw err;
    }
  }

  /**
   * (async) Query the database for a user with the provided username.
   * @param {String} username - Username of the user to find.
   * @returns {Promise} - A promise containing the user data on success,
   * a promise containing null if the user is not found, otherwise an error.
   */
  async findByUserName(username) {
    if (this.db_handle === null) return Promise.reject(new Error(_ERR_MSG_DB_HANDLE_IS_NULL));
    const sql_command = (
      "SELECT id id, username username, password password, created created\
      FROM users WHERE username = $username"
    );
    const sql_params = { $username: username };
    try {
      const user = await this.db_handle.get(sql_command, sql_params);
      return user;
    } catch (err) {
      logger.error(`An error occurred while finding user by username: ${username}; error: ${err}`);
      throw err;
    }
  }

  /**
   * (async) Check whether a user with the provided ID exists in the database.
   * @param {String} user_id - ID of the user to find
   * @returns {Promise} - A promise resolving true if the user exists,
   * false if the user does not exists, or appropriate error code.
   */
  async userExists(user_id) {
    const user = await this.findById(user_id);
    return Promise.resolve(user !== null);
  }

  /**
   * (async) Update the password of the user with the given user ID.
   * @param {String} user_id - ID of the user whose password to update
   * @param {String} new_password - Hash of the user's new password
   * @returns {Promise} - A void promise if successful, otherwise an error.
   * 
   * @warning Do NOT store raw passwords when creating new users.
   */
  async updatePassword(user_id, new_password) {
    if (this.db_handle === null) return Promise.reject(new Error(_ERR_MSG_DB_HANDLE_IS_NULL));

    const user_exists = await this.userExists(user_id);
    if (!user_exists){
      return Promise.reject(new Error(_ERR_MSG_USER_NOT_FOUND));
    }

    const sql_command = "UPDATE users SET password = $password WHERE id = $id";
    const sql_params = {
      $id: user_id,
      $password: new_password,
    };
    try {
      await this.db_handle.run(sql_command, sql_params);
      logger.info(`Successfully updated the password of user with ID ${user_id}`);
    } catch (err) {
      logger.error(`An error occurred while updating password of user with ID ${user_id}; ${err}`);
      throw err;
    }
  }

  /**
   * (async) Delete a user from the database.
   * @param {String} user_id - ID of the user to be deleted
   * @returns {Promise} - A void promise if successful, otherwise an error.
   */
  async deleteUser(user_id) {
    if (this.db_handle === null) return Promise.reject(new Error(_ERR_MSG_DB_HANDLE_IS_NULL));

    const user_exists = await this.userExists(user_id);
    if (!user_exists){
      return Promise.reject(new Error(_ERR_MSG_USER_NOT_FOUND));
    }

    const sql_command = ("DELETE FROM users WHERE id = $id");
    const sql_params = { $id: user_id };
    try {
      await this.db_handle.run(sql_command, sql_params);
      logger.info(`Successfully deleted the user with ID ${user_id}`);
    } catch (err) {
      logger.error(`An error occurred while deleting the user with ID ${user_id}; ${err}`);
      throw err;
    }
  }

  /**
   * Remove sensitive information from the provided user data, such as password hash.
   * @param {Object} user - User data to sanitize.
   * @returns {Object} Sanitized user data.
   */
  sanitize(user) {
    if (!user) return null;
    const { password, ...user_data } = user;
    return user_data;
  }
}

module.exports = User;
//===========================================================================