//===========================================================================
//  
//===========================================================================
const { Sequelize } = require('sequelize');
const { database, User } = require('../../src/models');

describe('Database', () => {
  it('should initialize correctly', async () => {
    const db = await database.initialize(':memory:');
    expect(db.sequelize instanceof Sequelize).toEqual(true);
    expect(db.sequelize.models.user === User).toEqual(true);
    expect(typeof db.close).toEqual('function');
    db.close();
  });
});
//===========================================================================
