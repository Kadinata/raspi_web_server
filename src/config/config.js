//===========================================================================
//  
//===========================================================================
const path = require('path');

const Config = {
  DEFAULT_SERVER_PORT: 3000,

  PATH_PUBLIC_DIR: path.join(__dirname, '../../public'),
  PATH_JWT_SECRET: path.join(__dirname, '../../app_data/jwt/secret'),
  PATH_DATABASE_FILE: path.join(__dirname, '../../app_data/db/database.db'),

  API_ROOT_ENDPOINT: '/api/v1',
}

module.exports = Object.freeze(Config);
//===========================================================================