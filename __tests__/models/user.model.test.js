//===========================================================================
//  
//===========================================================================
const { Sequelize } = require('sequelize');
const { User } = require('../../src/models/user.model');

describe('User Model', () => {

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

  let sequelize = null;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: 'sqlite',
      storage: ':memory:',
    });
    User.initialize(sequelize);
    await sequelize.sync();
  });

  afterEach(async () => {
    sequelize.close();
  });

  describe('when creating a new user', () => {
    it('should succeed when the username is not already taken', async () => {
      for (const test_user of test_users) {
        const { username, password } = test_user;
        await expect(User.create({ username, password })).resolves.toEqual(
          expect.objectContaining({ username, password })
        );
      }
    });

    it('should throw an error when the username is already taken', async () => {
      const { username, password } = test_users[0];
      await expect(User.create({ username, password })).resolves.toBeTruthy();
      await expect(User.create({ username, password })).rejects.toThrow();
    });

    it('should throw an error when the username and/or password are missing', async () => {
      const { username, password } = test_users[0];
      await expect(User.create({ username, password: null })).rejects.toThrow();
      await expect(User.create({ username: null, password })).rejects.toThrow();
      await expect(User.create({ username: null, password: null })).rejects.toThrow();
    });
  });

  describe('when finding a user', () => {
    describe('by username', () => {
      it('should find the user if it exists', async () => {
        const { username, password } = test_users[0];
        await User.create({ username, password });
        await expect(User.findByUserName(username)).resolves.toEqual(
          expect.objectContaining({ username, password })
        );
      });

      it('should return null if the user does not exist', async () => {
        const { username, password } = test_users[0];
        await User.create({ username, password });
        await expect(User.findByUserName('NoName')).resolves.toBeNull();
      });
    });

    describe('by ID', () => {
      it('should find the user if it exists', async () => {
        const { username, password } = test_users[0];
        await User.create({ username, password });
        await expect(User.findById(1)).resolves.toEqual(
          expect.objectContaining({ username, password, id: 1 })
        );
      });

      it('should return null if the user does not exist', async () => {
        const { username, password } = test_users[0];
        await User.create({ username, password });
        await expect(User.findById(100)).resolves.toBeNull();
      });
    });

    describe('to check if the user exists', () => {
      it('should return true if the user exists', async () => {
        const { username, password } = test_users[0];
        await User.create({ username, password });
        await expect(User.exists(1)).resolves.toEqual(true);
      });

      it('should return false if the user does not exist', async () => {
        const { username, password } = test_users[0];
        await User.create({ username, password });
        await expect(User.exists(100)).resolves.toEqual(false);
      });
    });
  });

  describe('when updating password', () => {
    it('should succeed if the user exists and a new password is provided', async () => {
      const { username, password, newPassword } = test_users[0];
      await User.create({ username, password });
      await expect(User.updatePassword(1, newPassword)).resolves.not.toThrow();
      await expect(User.findById(1)).resolves.toEqual(
        expect.objectContaining({ username, password: newPassword })
      );
    });

    it('should throw an error if the user exists but no new password is provided', async () => {
      const { username, password } = test_users[0];
      await User.create({ username, password });
      await expect(User.updatePassword(1, null)).rejects.toThrow();
    });
  });

  describe('when deleting user', () => {
    it('should succeed if the user to be deleted exists', async () => {
      const { username, password } = test_users[0];
      await User.create({ username, password });
      await expect(User.exists(1)).resolves.toEqual(true);
      await expect(User.deleteUser(1)).resolves.toEqual(true);
      await expect(User.exists(1)).resolves.toEqual(false);
    });

    it('should throw an error if the user to be deleted does not exist', async () => {
      await expect(User.deleteUser(100)).rejects.toThrow();
    });
  });

  describe('when sanitizing user data', () => {
    it('should remove the password field from the user object', async () => {
      const { username, password } = test_users[0];
      const user = await User.create({ username, password });
      const sanitized_user = user.sanitize();
      expect(sanitized_user.id).toEqual(1);
      expect(sanitized_user.username).toEqual(username);
      expect(sanitized_user.password).toBeUndefined();
      expect(sanitized_user.created).toBeDefined();
    });
  });
});
//===========================================================================