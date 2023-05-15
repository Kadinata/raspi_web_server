//===========================================================================
//  
//===========================================================================
const Database = require('../../../src/modules/database/database');

describe('Database Module Tests', () => {

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

  it(
    'should not initialize a database instance that has already been initialized.',
    async () => {
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

  it(
    'should perform create table, insert, and select operations successfully',
    async () => {

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
      await expect(instance.get(SQL_GET_COMMAND, {$key: 'key'})).resolves.toEqual(expected_data);
      instance.close();
    });
});

//===========================================================================