//===========================================================================
//  
//===========================================================================
const App = require('../app');

const start = async (config) => {
  const port = process.env.port || config.DEFAULT_SERVER_PORT;
  const app = await App.initialize(config);
  app.start(port);
};

module.exports = { start }
//===========================================================================