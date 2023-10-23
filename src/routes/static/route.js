//===========================================================================
//  
//===========================================================================
const express = require('express');
const path = require('path');

const initialize = (public_directory_path) => {
  const router = express.Router();

  router.use(express.static(public_directory_path));

  /** 
   * This is used to respond to request like GET /login with
   * the SPA on index.html rather than returning a 404.
   */
  router.get('*', (req, res, next) => {
    res.sendFile(path.join(public_directory_path, '/index.html'));
  });

  return router;
};

module.exports = { initialize };
//===========================================================================