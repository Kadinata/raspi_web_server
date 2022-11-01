//===========================================================================
//  
//===========================================================================
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const passport = require('passport');
const static_route = require('../routes/static');

const DEFAULT_PORT = 3000;

const start = () => {

  const port = process.env.port || DEFAULT_PORT;

  const cors_options = {
    origin: 'http://localhost:3000',
    credentials: true,
  };

  const app = express();

  app.set('json spaces', 2);

  app.use(cors(cors_options));
  app.use(cookieParser());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(passport.initialize());
  app.use(static_route);

  app.listen(port, () => console.log(`Server is listening on port ${port}`));

  return app;
};

module.exports = { start };
//===========================================================================