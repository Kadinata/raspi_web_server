//===========================================================================
//  
//===========================================================================
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');
const logger = require('../../common/logger').getLogger('DB');

const _ERR_MSG_DB_NOT_INITIALIZED = 'Database instance not initialized';
const _ERR_MSG_DB_ALREADY_INITIALIZED = 'The database instance has already been initialized';
const _IM_MEMORY_DB = ':memory:';

/**
 * A helper function to create the directory for the db file if none exists.
 * @param {String} path_to_db_file - The path to be created
 * @returns {Promise} - A resolved promise if no error, a rejected promise otherwise.
 */
const create_db_directory = (path_to_db_file) => {
  return new Promise((resolve, reject) => {
    if (path_to_db_file === _IM_MEMORY_DB) {
      return resolve();
    }
    fs.mkdir(path.dirname(path_to_db_file), { recursive: true }, (err) => {
      return err ? reject(err) : resolve();
    });
  });
}

/**
 * A helper function to initialize a sqlite3 database instance.
 * @param {String} path_to_db_file - Path to the file containing the database.
 * @returns {Promise} - A promise resolving to the instance if no error, a rejected promise otherwise.
 */
const create_sqlite3_db_instance = (path_to_db_file) => {
  return new Promise((resolve, reject) => {
    let instance = null;
    instance = new sqlite3.Database(path_to_db_file, (err) => {
      if (err) {
        logger.error(`Database instance creation error: ${err.message}`);
        instance = null;
        return reject(err);
      } else {
        return resolve(instance);
      }
    });
  });
};

class Database {

  /**
   * Object constructor
   */
  constructor() {
    this.instance = null;
    this.path_to_db_file = '';
  }

  /**
   * (async) Initializes the database instance. This would create a new SQLite DB instance.
   * @param {String} path_to_db_file - Path to the database file
   * @returns {Promise} - A void promise on success, otherwise an error.
   */
  init(path_to_db_file) {
    return new Promise((resolve, reject) => {
      if (this.instance !== null) {
        return reject(new Error(_ERR_MSG_DB_ALREADY_INITIALIZED));
      }
      return resolve();
    })
      .then(() => create_db_directory(path_to_db_file))
      .then(() => create_sqlite3_db_instance(path_to_db_file))
      .then((instance) => {
        this.instance = instance;
        this.path_to_db_file = path_to_db_file;
        logger.info('Database instance created');
      });
  }

  /**
   * (async) Run a SQL command on the database without returning the result.
   * Use this method for creating table or inserting a new row.
   * @param {String} statement - SQL command to run 
   * @param {Object} params - SQL parameters for the command
   * @returns {Promise} - A void promise on success, otherwise an error.
   */
  run(statement, params) {
    return new Promise((resolve, reject) => {
      if (this.instance === null) return reject(new Error(_ERR_MSG_DB_NOT_INITIALIZED));
      this.instance.serialize(() => {
        this.instance.run(statement, params, (err) => (err ? reject(err) : resolve()));
      });
    });
  };

  /**
   * (async) Run a SQL query on the database and return the result.
   * @param {String} statement - SQL query to run 
   * @param {Object} params - SQL parameters for the query
   * @returns {Promise} - A promise containing the query result on success, otherwise an error.
   */
  get(statement, params) {
    return new Promise((resolve, reject) => {
      if (this.instance === null) return reject(new Error(_ERR_MSG_DB_NOT_INITIALIZED));
      this.instance.serialize(() => {
        this.instance.get(statement, params, (err, row) => (err ? reject(err) : resolve(row || null)));
      });
    });
  }

  /**
   * Close down the SQLite database instance.
   */
  close() {
    if (this.instance === null) return;
    this.instance.close((err) => {
      if (err) {
        logger.error(`Error encountered while closing database: ${err.message}`);
      }
      logger.info('Database connection has been closed.');
    });
  }
}

module.exports = Database;
//===========================================================================