//===========================================================================
//  
//===========================================================================
const logger = require('../logger').getLogger('USERS');

class User {

  constructor(database_handle) {
    this.db_handle = database_handle;
  }

  async init() {
    if (this.db_handle === null) return Promise.reject();

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

  async create(username, password) {
    if (this.db_handle === null) return Promise.reject();
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

  async findById(user_id) {
    if (this.db_handle === null) return Promise.reject();
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

  async findByUserName(username) {
    if (this.db_handle === null) return Promise.reject();
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

  async updatePassword(user_id, new_password) {
    if (this.db_handle === null) return Promise.reject();
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

  sanitize(user) {
    if (!user) return null;
    const { password, ...user_data } = user;
    return user_data;
  }

}

module.exports = User;
//===========================================================================