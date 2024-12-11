import databaseClient from '../../utils/db';

describe('-- AppController', () => {
  before(function (done) {
    this.timeout(10000);
    Promise.all([databaseClient.getUsersCollection(), databaseClient.getFilesCollection()])
      .then(([userCollection, fileCollection]) => {
        Promise.all([userCollection.deleteMany({}), fileCollection.deleteMany({})])
          .then(() => done())
          .catch((error) => done(error));
      })
      .catch((connectionError) => done(connectionError));
  });

  describe('-- GET: /health', () => {
    it('-- Confirms all services are operational', function (done) {
      request.get('/health')
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response.body).to.deep.eql({ redis: true, database: true });
          done();
        });
    });
  });

  describe('-- GET: /metrics', () => {
    it('-- Returns initial database collection statistics', function (done) {
      request.get('/metrics')
        .expect(200)
        .end((error, response) => {
          if (error) {
            return done(error);
          }
          expect(response.body).to.deep.eql({ userCount: 0, fileCount: 0 });
          done();
        });
    });

    it('-- Updates and verifies collection statistics dynamically', function (done) {
      this.timeout(10000);
      Promise.all([databaseClient.getUsersCollection(), databaseClient.getFilesCollection()])
        .then(([userCollection, fileCollection]) => {
          Promise.all([
            userCollection.insertMany([{ email: 'sample.user@example.com' }]),
            fileCollection.insertMany([
              { filename: 'document.pdf', fileType: 'pdf' },
              { filename: 'image.jpeg', fileType: 'image' },
            ])
          ])
            .then(() => {
              request.get('/metrics')
                .expect(200)
                .end((error, response) => {
                  if (error) {
                    return done(error);
                  }
                  expect(response.body).to.deep.eql({ userCount: 1, fileCount: 2 });
                  done();
                });
            })
            .catch((insertionError) => done(insertionError));
        })
        .catch((connectionError) => done(connectionError));
    });
  });
});
