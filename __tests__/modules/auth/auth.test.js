//===========================================================================
//  
//===========================================================================
const bcrypt = require('bcrypt');
const Auth = require('../../../src/modules/auth/auth');
const database = require('../../../src/modules/database');
const passport_config = require('../../../src/modules/auth/auth_passport_config');

const DB_FILE_PATH = ':memory:';
const TEST_JWT_SECRET = 'This is a test JWT secret';

const mock_passport_config = jest.spyOn(passport_config, 'configure');
const mock_bcrypt_hash = jest.spyOn(bcrypt, 'hash');
const mock_bcrypt_compare = jest.spyOn(bcrypt, 'compare');

const TEST_USERS = [
  { username: 'username1', password: 'password1' },
  { username: 'username2', password: 'password2' },
];

describe('Auth Class Tests', () => {

  let db = null;

  beforeEach(async () => {
    db = await database.initialize(DB_FILE_PATH);
    jest.clearAllMocks();
  });

  afterEach(() => {
    if (db !== null) {
      db.close();
    }
  });

  it('should initializes an instance correctly', () => {
    expect(mock_passport_config).toHaveBeenCalledTimes(0);

    const auth = new Auth(db.user_model, TEST_JWT_SECRET);
    expect(mock_passport_config).toHaveBeenCalledTimes(1);
    expect(mock_passport_config.mock.calls[0][0]).toEqual(auth);
    expect(mock_passport_config.mock.calls[0][1]).toEqual(TEST_JWT_SECRET);
  });

  it('should allow multiple new users to register', async () => {
    const mock_create_user = jest.spyOn(db.user_model, 'create');

    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);
    expect(mock_create_user).toHaveBeenCalledTimes(0);

    const user1 = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(mock_create_user).toHaveBeenCalledTimes(1);

    expect(user1).not.toEqual(null);
    expect(user1.username).toEqual(TEST_USERS[0].username);
    expect(user1.id).not.toBeUndefined();
    expect(user1.created).not.toBeUndefined();

    const user2 = await auth.registerUser(TEST_USERS[1].username, TEST_USERS[1].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(2);
    expect(mock_create_user).toHaveBeenCalledTimes(2);

    expect(user2).not.toEqual(null);
    expect(user2.username).toEqual(TEST_USERS[1].username);
    expect(user2.id).not.toBeUndefined();
    expect(user2.created).not.toBeUndefined();
  });

  it('should not allow a user to register with an existing username', async () => {
    const mock_create_user = jest.spyOn(db.user_model, 'create');

    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);
    expect(mock_create_user).toHaveBeenCalledTimes(0);

    const user1 = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(mock_create_user).toHaveBeenCalledTimes(1);

    expect(user1).not.toEqual(null);
    expect(user1.username).toEqual(TEST_USERS[0].username);
    expect(user1.id).not.toBeUndefined();
    expect(user1.created).not.toBeUndefined();

    const user2 = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[1].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(mock_create_user).toHaveBeenCalledTimes(1);

    expect(user2).toEqual(null);
  });

  it('should allow a user with correct password to login', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);

    const result = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(1);
    expect(result).toEqual(user);
  });

  it('should not allow a user with an incorrect password to login', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);

    const result = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[1].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(1);
    expect(result).toEqual(null);
  });

  it('should not allow a nonexistent user to login', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);

    const result = await auth.authenticateUser(TEST_USERS[1].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);
    expect(result).toEqual(null);
  });

  it('should allow a user with correct password to update password', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);

    /** Logging in with the correct current password should succeed */
    const result_login_1 = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(1);
    expect(result_login_1).toEqual(user);

    /** Updating password with the correct current password should succeed */
    const result_update_pw = await auth.updateUserPassword(user.id, TEST_USERS[0].password, TEST_USERS[1].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(2);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(2);
    expect(result_update_pw.error).toEqual(null);
    expect(result_update_pw.user).toEqual(user);

    /** Logging in with the original password should fail */
    const result_login_2 = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(3);
    expect(result_login_2).toEqual(null);

    /** Logging in with the new password should succeed */
    const result_login_3 = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[1].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(4);
    expect(result_login_3).toEqual(user);
  });

  it('should not allow a user with incorrect password to update password', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);

    /** Updating password with an incorrect current password should fail */
    const result_update_pw = await auth.updateUserPassword(user.id, TEST_USERS[1].password, TEST_USERS[1].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(1);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(result_update_pw.error).not.toEqual(null);
    expect(result_update_pw.user).toEqual(null);

    /** Logging in with the original password should still succeed */
    const result_login = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(2);
    expect(result_login).toEqual(user);
  });

  it('should not allow a user to update to the same password', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);

    /** Updating password with the correct current password to the same password should fail */
    const result_update_pw = await auth.updateUserPassword(user.id, TEST_USERS[0].password, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(1);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(result_update_pw.error).not.toEqual(null);
    expect(result_update_pw.user).toEqual(null);

    /** Logging in with the original password should still succeed */
    const result_login = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(2);
    expect(result_login).toEqual(user);
  });

  it('should not allow a nonexistent user to update password', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);

    /** Updating password as a non-existent user should fail */
    const result_update_pw = await auth.updateUserPassword(0xBADDF00D, TEST_USERS[0].password, TEST_USERS[1].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(result_update_pw.error).not.toEqual(null);
    expect(result_update_pw.user).toEqual(null);

    /** Existing user logging in with the original password should still succeed */
    const result_login = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(1);
    expect(result_login).toEqual(user);
  });

  it('should not allow passwords to be updated into an empty string', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);

    /** Updating password to an empty password should fail */
    const result_update_pw = await auth.updateUserPassword(user.id, TEST_USERS[0].password, '');
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(result_update_pw.error).not.toEqual(null);
    expect(result_update_pw.user).toEqual(null);

    /** Logging in with the original password should still succeed */
    const result_login = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(1);
    expect(result_login).toEqual(user);
  });

  it('should handle password update failure gracefully', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    /** Mock the user model's update password to induce an error */
    const mock_user_update_password = jest.spyOn(db.user_model, 'updatePassword')
      .mockImplementationOnce((user_id, new_password) => {
        throw new Error('An induced error has occurred.');
      });

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);

    /** Register a test user */
    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);

    /** Logging in with the correct current password should succeed */
    const result_login_1 = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(1);
    expect(result_login_1).toEqual(user);

    /** Updating password with the correct current password should succeed */
    const result_update_pw = await auth.updateUserPassword(user.id, TEST_USERS[0].password, TEST_USERS[1].password);
    expect(mock_user_update_password).toHaveBeenCalledTimes(1);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(2);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(2);
    expect(result_update_pw.error).not.toEqual(null);
    expect(result_update_pw.user).toEqual(null);

    /** Logging in with the original password should still succeed */
    const result_login_2 = await auth.authenticateUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(3);
    expect(result_login_2).toEqual(user);
  });

  it('should be able to find user by ID', async () => {
    const auth = new Auth(db.user_model, TEST_JWT_SECRET);

    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(0);

    const user = await auth.registerUser(TEST_USERS[0].username, TEST_USERS[0].password);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);
    expect(user).not.toEqual(null);
    expect(user.username).toEqual(TEST_USERS[0].username);
    expect(user.id).not.toBeUndefined();
    expect(user.created).not.toBeUndefined();

    expect(mock_bcrypt_compare).toHaveBeenCalledTimes(0);
    expect(mock_bcrypt_hash).toHaveBeenCalledTimes(1);

    /** Finding a user by existing user ID should succeed */
    const result_1 = await auth.findUserById(user.id);
    expect(result_1).toEqual(user);

    /** Finding a user by non-existing user ID should fail */
    const result_2 = await auth.findUserById(0xBADDF00D);
    expect(result_2).toEqual(null);
  });
});
//===========================================================================