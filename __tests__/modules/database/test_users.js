//===========================================================================
//  
//===========================================================================
const Database = require('../../../src/modules/database/database');
const Users = require('../../../src/modules/database/users');

describe('Database Module Tests', () => {

  let instance = null;

  const test_users = [
    {
      username: 'user1',
      password: 'testPW1',
      newPassword: 'newPW1',
    }, {
      username: 'user2',
      password: 'testPW2',
      newPassword: 'newPW2',
    },
  ];

  const initializeDatabase = async () => {
    instance = new Database();
    await instance.init(':memory:');
  };

  beforeAll(async () => {
    await initializeDatabase();
  });

  afterAll(() => {
    if (instance !== null) {
      instance.close();
    }
  });

  it('should fail API calls when the db handle is not set', async () => {
    const users = new Users(null);
    await expect(users.init()).rejects.toBeTruthy();
    await expect(users.create('username', 'password')).rejects.toBeTruthy();
    await expect(users.findById(1)).rejects.toBeTruthy();
    await expect(users.findByUserName('username')).rejects.toBeTruthy();
    await expect(users.userExists(1)).rejects.toBeTruthy();
    await expect(users.updatePassword(1, 'password')).rejects.toBeTruthy();
    await expect(users.deleteUser(1)).rejects.toBeTruthy();
  });

  it('should successfully create the user table with a proper db handle', async () => {
    const users = new Users(instance);
    await expect(users.init()).resolves.toBeUndefined();
  });

  it('should not create users with missing information', async () => {
    const users = new Users(instance);
    await expect(users.create(null, null)).rejects.toBeTruthy();
    await expect(users.create('user', null)).rejects.toBeTruthy();
    await expect(users.create(null, 'password')).rejects.toBeTruthy();
  });

  it('should be able to create new users successfully', async () => {
    const users = new Users(instance);
    for (const test_user of test_users) {
      const { username, password } = test_user;
      await expect(users.create(username, password)).resolves.toBeUndefined();
    }
  });

  it('should be able to find existing user by username', async () => {
    const users = new Users(instance);
    for (const test_user of test_users) {
      const { username, password } = test_user;
      const result = await users.findByUserName(username);
      expect(result.username).toEqual(username);
      expect(result.password).toEqual(password);
    }
  });

  it('should return null when finding user from non-existent username', async () => {
    const users = new Users(instance);
    await expect(users.findByUserName('NoName')).resolves.toBe(null);
  });

  it('should be able to find existing user by user ID', async () => {
    const users = new Users(instance);
    for (const user_id of [1, 2]) {
      const { username, password } = test_users[user_id - 1];
      const result = await users.findById(user_id);
      expect(result.username).toEqual(username);
      expect(result.password).toEqual(password);
      expect(result.id).toEqual(user_id);
    }
  });

  it('should return null when finding user from non-existent user ID', async () => {
    const users = new Users(instance);
    await expect(users.findById(-1)).resolves.toBe(null);
  });

  it('should succeed when updating the password of an existing user', async () => {
    const users = new Users(instance);
    for (const test_user of test_users) {
      const { username, password, newPassword } = test_user;
      let result = await users.findByUserName(username);
      expect(result.password).toEqual(password);
      await expect(users.updatePassword(result.id, newPassword)).resolves.toBeUndefined();
      newresult = await users.findByUserName(username);
      expect(newresult.password).toEqual(newPassword);
    }
  });

  it('should return an error when updating the password of a non-existing user',
    async () => {
      const users = new Users(instance);
      await expect(users.updatePassword(-1, "newPassword")).rejects.toBeTruthy();
    });

  it('should remove password from when sanitizing user data', async () => {
    const users = new Users(instance);
    for (const test_user of test_users) {
      const { username } = test_user;
      let result = await users.findByUserName(username);
      let { password, ...expected } = result;
      let sanitized = users.sanitize(result);
      expect(sanitized).toEqual(expected);
    }
  });

  it('should succeed when deleting an existing user', async () => {
    const users = new Users(instance);
    const { username } = test_users[0];
    let result = await users.findByUserName(username);
    await expect(users.userExists(result.id)).resolves.toBe(true);
    await expect(users.deleteUser(result.id)).resolves.toBeUndefined();
    await expect(users.userExists(result.id)).resolves.toBe(false);
  });

  it('should return an error when deleting a non-existing user',
    async () => {
      const users = new Users(instance);
      await expect(users.deleteUser(-1)).rejects.toBeTruthy();
    });
});

//===========================================================================