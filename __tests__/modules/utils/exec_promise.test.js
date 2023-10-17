//===========================================================================
//  
//===========================================================================
const child_process = require('child_process');
const exec_promise = require('../../../src/modules/utils/exec_promise');

const EXEC_COMMAND_SUCCESS = 'This command should succeed';
const EXEC_COMMAND_FAILURE = 'This command should fail';
const EXEC_RESPONSE_SUCCESS = 'A successful response';
const EXEC_RESPONSE_FAILURE = 'A failure occurred';

jest.mock('child_process', () => ({
  exec: jest.fn((command, callback) => {
    if (command == EXEC_COMMAND_SUCCESS) {
      callback(null, EXEC_RESPONSE_SUCCESS, null);
    }
    else {
      callback(EXEC_RESPONSE_FAILURE, null, null);
    }
  }),
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Promissified Exec Function Tests', () => {
  it('should return a resolved promise if a command executes with no error', async () => {
    expect(child_process.exec).toHaveBeenCalledTimes(0);
    const result = exec_promise(EXEC_COMMAND_SUCCESS);

    expect(result instanceof Promise).toBe(true);
    await expect(result).resolves.toBeTruthy();
    await expect(result).resolves.toEqual(EXEC_RESPONSE_SUCCESS);

    expect(child_process.exec).toHaveBeenCalledTimes(1);
    expect(child_process.exec.mock.calls[0][0]).toEqual(EXEC_COMMAND_SUCCESS);
    expect(typeof child_process.exec.mock.calls[0][1]).toEqual('function');
  });

  it('should return a rejected promise if a command executes with error', async () => {
    expect(child_process.exec).toHaveBeenCalledTimes(0);
    const result = exec_promise(EXEC_COMMAND_FAILURE);

    expect(result instanceof Promise).toBe(true);
    await expect(result).rejects.toBeTruthy();
    await expect(result).rejects.toEqual(EXEC_RESPONSE_FAILURE);

    expect(child_process.exec).toHaveBeenCalledTimes(1);
    expect(child_process.exec.mock.calls[0][0]).toEqual(EXEC_COMMAND_FAILURE);
    expect(typeof child_process.exec.mock.calls[0][1]).toEqual('function');
  });
});
//===========================================================================