const Database = require('./database');
const UserModel = require('./users');
const logger = require('../logger').getLogger('DB');

const initialize = async (path_to_db_file) => {

  const handle = new Database(path_to_db_file);
  const user_model = new UserModel(handle);

  const close = () => {
    handle.close();
    logger.info('Connection to database has been closed');
  };

  try {
    await handle.init();
    await user_model.init();
  } catch (err) {
    throw err;
  }

  logger.info('Database module has been initialized');
  return { handle, user_model, close };
};

module.exports = { initialize };