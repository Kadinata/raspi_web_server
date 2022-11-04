//===========================================================================
//  
//===========================================================================
const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

const _ERR_MSG_DB_NOT_INITIALIZED = 'Database instance not initialized';

class Database {

  constructor(path_to_db_file) {
    this.instance = null;
    this.path_to_db_file = path_to_db_file;
  }

  init() {
    return new Promise((resolve, reject) => {
      if (this.instance !== null) return resolve();

      fs.mkdir(path.dirname(this.path_to_db_file), { recursive: true }, (err) => {
        if (err) {
          return reject(err);
        }
      });

      this.instance = new sqlite3.Database(this.path_to_db_file, (err) => {
        if (err) {
          console.log(err.message);
          return reject(err);
        }
      });
      console.log('Connected to Database.');

      return resolve();
    });
  }

  run(statement, params) {
    return new Promise((resolve, reject) => {
      if (this.instance === null) return reject(new Error(_ERR_MSG_DB_NOT_INITIALIZED));
      this.instance.serialize(() => {
        this.instance.run(statement, params, (err) => (err ? reject(err) : resolve()));
      });
    });
  };

  get(statement, params) {
    return new Promise((resolve, reject) => {
      if (this.instance === null) return reject(new Error(_ERR_MSG_DB_NOT_INITIALIZED));
      this.instance.serialize(() => {
        this.instance.get(statement, params, (err, row) => (err ? reject(err) : resolve(row || null)));
      });
    });
  }

  close() {
    if (this.instance === null) return;
    this.instance.close((err) => {
      if (err) return console.log(err.message);
      console.log('Database connection has been closed.');
    });
  }

}

module.exports = Database;
//===========================================================================