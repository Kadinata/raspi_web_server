const Database = require('./database');
const UserModel = require('./users');

const initialize = async (path_to_db_file) => {

  const handle = new Database(path_to_db_file);
  const user_model = new UserModel(handle);

  const close = () => {
    console.log('Closing database connection.');
    handle.close();
  };

  try {
    await handle.init();
    await user_model.init();
  } catch (err) {
    throw err;
  }

  return { handle, user_model, close };
};

module.exports = { initialize };