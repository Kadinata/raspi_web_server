//===========================================================================
//  
//===========================================================================
const express = require('express');
const handlers = require('./handler');
const protectedRoute = require('../../middlewares/auth/protected_route');

const initialize = () => {

  const router = express.Router();

  router.post('/register', handlers.register);
  router.post('/login', handlers.login);
  router.get('/user', protectedRoute, handlers.userAuth);
  router.post('/update_password', protectedRoute, handlers.updatePassword);

  return router;
};

module.exports = { initialize };
//===========================================================================