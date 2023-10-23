//===========================================================================
//  
//===========================================================================
const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3');
const Database = require('../../../src/modules/database/database');

beforeEach(() => {
  jest.clearAllMocks();
});

describe('Database Object Tests', () => {

  const SQL_CREATE_TABLE_COMMAND = (
    "CREATE TABLE IF NOT EXISTS data (\
      key VARCHAR(100) NOT NULL,\
      value VARCHAR(100) NOT NULL\
    )"
  );

  const SQL_INSERT_COMMAND = (
    "INSERT INTO data(key, value)\
    values($key, $value)"
  );

  const SQL_GET_COMMAND = (
    "SELECT key key, value value\
    FROM data WHERE key = $key"
  );

  it('should initialize a database instance successfully', async () => {
    const instance = new Database();
    await expect(instance.init(':memory:')).resolves.toBeUndefined();
    instance.close();
  });

  it('should not initialize an instance that has already been initialized.', async () => {
    const instance = new Database();
    await expect(instance.init(':memory:')).resolves.toBeUndefined();
    await expect(instance.init(':memory:')).rejects.toBeTruthy();
    instance.close();
  });

  it('should not run SQL queries on uninitiallized database instances', async () => {
    const instance = new Database();
    await expect(instance.run(SQL_CREATE_TABLE_COMMAND)).rejects.toBeTruthy();
    await expect(instance.get(SQL_GET_COMMAND, "key")).rejects.toBeTruthy();
    instance.close();
  });

  it('should perform create table, insert, and select operations successfully', async () => {

    sql_params = {
      $key: 'key',
      $value: 'value',
    };

    expected_data = {
      key: 'key',
      value: 'value',
    }

    const instance = new Database();
    await expect(instance.init(':memory:')).resolves.toBeUndefined();
    await expect(instance.run(SQL_CREATE_TABLE_COMMAND)).resolves.toBeUndefined();
    await expect(instance.run(SQL_INSERT_COMMAND, sql_params)).resolves.toBeUndefined();
    await expect(instance.get(SQL_GET_COMMAND, { $key: 'key' })).resolves.toEqual(expected_data);
    instance.close();
  });

  it('should handle query errors properly', async () => {
    const error = new Error('An induced error has occurred.');
    const instance = new Database();

    /** Initialize the database first */
    await expect(instance.init(':memory:')).resolves.toBeUndefined();

    /** Spy here because the internal DB instance is null before init */
    const mock_inst_serialize = jest.spyOn(instance.instance, 'serialize');
    const mock_inst_get = jest.spyOn(instance.instance, 'get');
    const mock_inst_run = jest.spyOn(instance.instance, 'run');

    /** Test for error handling in instance.run() */
    mock_inst_serialize.mockImplementationOnce((cb) => cb());
    mock_inst_run.mockImplementationOnce((stmt, params, cb) => cb(error, null));
    expect(mock_inst_serialize).toHaveBeenCalledTimes(0);
    expect(mock_inst_run).toHaveBeenCalledTimes(0);

    await expect(instance.run(SQL_CREATE_TABLE_COMMAND)).rejects.toBeTruthy();
    expect(mock_inst_serialize).toHaveBeenCalledTimes(1);
    expect(mock_inst_run).toHaveBeenCalledTimes(1);

    /** Test for error handling in instance.get() */
    mock_inst_serialize.mockImplementationOnce((cb) => cb());
    mock_inst_get.mockImplementationOnce((stmt, params, cb) => cb(error, null));
    expect(mock_inst_serialize).toHaveBeenCalledTimes(1);
    expect(mock_inst_get).toHaveBeenCalledTimes(0);

    await expect(instance.get(SQL_GET_COMMAND, { $key: 'key' })).rejects.toBeTruthy();
    expect(mock_inst_serialize).toHaveBeenCalledTimes(2);
    expect(mock_inst_run).toHaveBeenCalledTimes(1);
  });

  it('should handle closing errors properly', async () => {
    const error = new Error('An induced error has occurred.');
    const instance = new Database();

    /** Initialize the database first */
    await expect(instance.init(':memory:')).resolves.toBeUndefined();

    /** Spy here because the internal DB instance is null before init */
    const mock_inst_close_internal = jest.spyOn(instance.instance, 'close');
    mock_inst_close_internal.mockImplementationOnce((cb) => cb(error));

    /** Close the database connection */
    expect(mock_inst_close_internal).toHaveBeenCalledTimes(0);
    instance.close()
    expect(mock_inst_close_internal).toHaveBeenCalledTimes(1);
  });

  it('should create directories for the db file during initialization', async () => {
    const path_to_db_file = '/path/to/the/database.db';
    const mock_fs_mkdir = jest.spyOn(fs, 'mkdir').mockImplementationOnce((path, opts, cb) => cb());
    const mock_sqlite3 = jest.spyOn(sqlite3, 'Database').mockImplementationOnce((path, cb) => cb());

    const instance = new Database();

    expect(mock_fs_mkdir).toHaveBeenCalledTimes(0);
    expect(mock_sqlite3).toHaveBeenCalledTimes(0);

    await expect(instance.init(path_to_db_file)).resolves.toBeUndefined();
    expect(mock_fs_mkdir).toHaveBeenCalledTimes(1);
    expect(mock_sqlite3).toHaveBeenCalledTimes(1);
    expect(mock_fs_mkdir.mock.calls[0][0]).toEqual(path.dirname(path_to_db_file));
    expect(mock_sqlite3.mock.calls[0][0]).toEqual(path_to_db_file);
    instance.close();
  });

  it('should handle initialization errors properly', async () => {
    const error = new Error('An induced error has occurred.');
    const path_to_db_file = '/path/to/the/database.db';
    const mock_fs_mkdir = jest.spyOn(fs, 'mkdir');
    const mock_sqlite3 = jest.spyOn(sqlite3, 'Database');

    const instance = new Database();
    expect(mock_fs_mkdir).toHaveBeenCalledTimes(0);
    expect(mock_sqlite3).toHaveBeenCalledTimes(0);

    /** Test the case where fs.mkdir() results in an error */
    mock_fs_mkdir.mockImplementationOnce((path, opts, cb) => cb(error));

    await expect(instance.init(path_to_db_file)).rejects.toBeTruthy();
    expect(mock_fs_mkdir).toHaveBeenCalledTimes(1);
    expect(mock_sqlite3).toHaveBeenCalledTimes(0);
    expect(mock_fs_mkdir.mock.calls[0][0]).toEqual(path.dirname(path_to_db_file));

    /** Test the case where sqlite3.Database() results in an error */
    mock_fs_mkdir.mockImplementationOnce((path, opts, cb) => cb());
    mock_sqlite3.mockImplementationOnce((path, cb) => cb(error));

    await expect(instance.init(path_to_db_file)).rejects.toBeTruthy();
    expect(mock_fs_mkdir).toHaveBeenCalledTimes(2);
    expect(mock_sqlite3).toHaveBeenCalledTimes(1);
    expect(mock_fs_mkdir.mock.calls[0][0]).toEqual(path.dirname(path_to_db_file));
    expect(mock_sqlite3.mock.calls[0][0]).toEqual(path_to_db_file);
    instance.close();
  });
});
//===========================================================================