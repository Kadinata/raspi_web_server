//===========================================================================
//  
//===========================================================================
const App = require('../app');

const DEFAULT_PORT = 3000;

const start = async () => {
  const port = process.env.port || DEFAULT_PORT;
  const app = await App.initialize();
  app.start(port);
};

module.exports = { start }
//===========================================================================