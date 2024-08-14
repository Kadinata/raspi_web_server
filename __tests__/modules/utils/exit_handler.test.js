//===========================================================================
//  
//===========================================================================
const process = require('process');

jest.mock('process', () => {
  mock_callbacks = {};
  return ({
    on: jest.fn((code, callback) => {
      mock_callbacks[code] = callback;
    }),
    exit: jest.fn(),
    emit: (code) => {
      if (typeof mock_callbacks[code] === 'function') {
        mock_callbacks[code](code);
      }
    },
  });
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Exit Handler Utility Module Tests', () => {

  it('should return a function to register callbacks', () => {
    expect(process.on).toHaveBeenCalledTimes(0);
    expect(process.exit).toHaveBeenCalledTimes(0);

    const exitHandler = require('../../../src/common/utils/exit_handler');
    expect(process.on).toHaveBeenCalledTimes(3);
    expect(process.exit).toHaveBeenCalledTimes(0);

    expect(typeof exitHandler.register).toEqual('function');
  });

  it('should register an exit handler callback successfully', () => {
    const exitHandler = require('../../../src/common/utils/exit_handler');
    const mock_callback = jest.fn();
    expect(() => exitHandler.register(mock_callback)).not.toThrow();
    expect(mock_callback).toHaveBeenCalledTimes(0);
  });

  it('should throw an error when attempting to register a non-function exit handler', () => {
    const exitHandler = require('../../../src/common/utils/exit_handler');
    expect(() => exitHandler.register(null)).toThrow();
  });

  it('should invoke registered callbacks on an exit signal', () => {
    const exitHandler = require('../../../src/common/utils/exit_handler');
    const mock_callback = jest.fn();
    expect(() => exitHandler.register(mock_callback)).not.toThrow();
    expect(mock_callback).toHaveBeenCalledTimes(0);
    expect(process.exit).toHaveBeenCalledTimes(0);
    process.emit('exit');
    expect(mock_callback).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledTimes(1);
  });

  it('should invoke registered callbacks on a SIGINT signal', () => {
    const exitHandler = require('../../../src/common/utils/exit_handler');
    const mock_callback = jest.fn();
    expect(() => exitHandler.register(mock_callback)).not.toThrow();
    expect(mock_callback).toHaveBeenCalledTimes(0);
    expect(process.exit).toHaveBeenCalledTimes(0);
    process.emit('SIGINT');
    expect(mock_callback).toHaveBeenCalledTimes(1);
    expect(process.exit).toHaveBeenCalledTimes(1);
  });

  it('should handle but not invoke registered callbacks on an unknown exception', () => {
    const exitHandler = require('../../../src/common/utils/exit_handler');
    const mock_callback = jest.fn();
    expect(() => exitHandler.register(mock_callback)).not.toThrow();
    expect(mock_callback).toHaveBeenCalledTimes(0);
    expect(process.exit).toHaveBeenCalledTimes(0);
    process.emit('uncaughtException');
    expect(mock_callback).toHaveBeenCalledTimes(0);
    expect(process.exit).toHaveBeenCalledTimes(0);
  });
});
//===========================================================================
