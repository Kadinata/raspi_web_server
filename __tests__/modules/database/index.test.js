//===========================================================================
//  
//===========================================================================
const database = require('../../../src/modules/database');
const Database = require('../../../src/modules/database/database');
const Users = require('../../../src/modules/database/users');

describe('Database Module Tests', () => {

  it('should initialize a database module successfully', async () => {
    const db = await database.initialize(':memory:');
    expect(db.handle instanceof Database).toBe(true);
    expect(db.user_model instanceof Users).toBe(true);
    expect(typeof db.close).toBe('function');
    db.close();
  });
});

//===========================================================================