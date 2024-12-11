import databaseClient from '../../utils/db';

describe('Database Utility Tests', () => {
  before(function (done) {
    this.timeout(10000); // Extend timeout to handle async setup
    Promise.all([databaseClient.getUsersCollection(), databaseClient.getFilesCollection()])
      .then(([usersCol, filesCol]) => {
        Promise.all([usersCol.deleteMany({}), filesCol.deleteMany({})])
          .then(() => done()) // Proceed when collections are cleared
          .catch((cleanupError) => done(cleanupError)); // Handle errors during cleanup
      })
      .catch((connectionError) => done(connectionError)); // Handle errors during connection
  });

  it('Should confirm that the database client is active', () => {
    expect(databaseClient.isAlive()).to.be.true;
  });

  it('Should verify nbUsers returns the expected count', async () => {
    expect(await databaseClient.getUserCount()).to.equal(0); // Verify user count
  });

  it('Should verify nbFiles returns the expected count', async () => {
    expect(await databaseClient.getFileCount()).to.equal(0); // Verify file count
  });
});