//===========================================================================
//  
//===========================================================================
const { Sequelize } = require('sequelize');
const { User } = require('./user.model');
const logger = require('../common/logger').getLogger('DB');

const _IM_MEMORY_DB = ':memory:';

const initialize = async (path_to_db_file) => {

  const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: path_to_db_file || _IM_MEMORY_DB,
    logging: (message) => logger.debug(message),
  });

  const close = () => {
    sequelize.close();
    logger.info('Connection to database has been closed');
  }

  User.initialize(sequelize);

  await sequelize.sync();

  return { sequelize, close };
};

module.exports = { initialize };
//===========================================================================