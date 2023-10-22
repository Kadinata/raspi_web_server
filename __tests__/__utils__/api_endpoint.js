//===========================================================================
//  
//===========================================================================
const express = require('express');
const STATUS_CODE = require('./status_codes');

const create = () => {

  const generate = () => {

    const _router = express.Router();
    const _handlers = {
      get: jest.fn((req, res, next) => {
        res.status(STATUS_CODE.NOT_FOUND).send('Not Implemented!')
      }),
      post: jest.fn((req, res, next) => {
        res.status(STATUS_CODE.NOT_FOUND).send('Not Implemented!')
      }),
    };

    const initialize = jest.fn(() => {
      _router.get('/', (req, res, next) => _handlers.get(req, res, next));
      _router.post('/', (req, res, next) => _handlers.post(req, res, next));
      return _router;
    });

    const get = {
      configure: (statusCode, message) => {
        _handlers.get = jest.fn((req, res, next) => {
          return res.status(statusCode).json({ message });
        });
      },
      handler: () => _handlers.get,
    };

    const post = {
      configure: (statusCode, message) => {
        _handlers.post = jest.fn((req, res, next) => {
          return res.status(statusCode).json({ message });
        });
      },
      handler: () => _handlers.post,
    };

    return { initialize, get, post };
  };

  return generate();
};

module.exports = { create };
//===========================================================================