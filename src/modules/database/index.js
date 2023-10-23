const Database = require('./database');
const UserModel = require('./users');
const logger = require('../logger').getLogger('DB');

const initialize = async (path_to_db_file) => {

  const handle = new Database();
  const user_model = new UserModel(handle);

  const close = () => {
    handle.close();
    logger.info('Connection to database has been closed');
  };

  await handle.init(path_to_db_file);
  await user_model.init();

  logger.info('Database module has been initialized');
  return { handle, user_model, close };
};

module.exports = { initialize };