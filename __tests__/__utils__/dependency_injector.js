//===========================================================================
//  
//===========================================================================
const NO_FAILURE = 0;

const create = (handler) => {
  let failure_mode = NO_FAILURE;

  const middleware = jest.fn((req, res, next) => {
    handler(failure_mode, req);
    next();
  });

  const setFailureMode = (mode) => {
    failure_mode = mode;
  }

  const reset = () => {
    failure_mode = NO_FAILURE;
  }

  return { middleware, setFailureMode, reset };
};

module.exports = { create, NO_FAILURE };
//===========================================================================