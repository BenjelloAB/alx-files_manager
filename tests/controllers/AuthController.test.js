/* eslint-disable import/no-named-as-default */
import dbClient from '../../utils/db';

describe('AuthController Tests', () => {
  const testUser = {
    email: 'sample_user@example.com',
    password: 'safe_password_123$',
  };
  let authToken = '';

  before(function (done) {
    this.timeout(10000);
    dbClient.usersCollection()
      .then((usersCollection) => {
        usersCollection.deleteMany({ email: testUser.email })
          .then(() => {
            request.post('/users')
              .send({
                email: testUser.email,
                password: testUser.password,
              })
              .expect(201)
              .end((requestErr, res) => {
                if (requestErr) {
                  return done(requestErr);
                }
                expect(res.body.email).to.eql(testUser.email);
                expect(res.body.id.length).to.be.greaterThan(0);
                done();
              });
          })
          .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
  });

  describe('GET: /connect Endpoint', () => {
    it('Fails when "Authorization" header is missing', function (done) {
      this.timeout(5000);
      request.get('/connect')
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done();
        });
    });

    it('Fails for non-existing user credentials', function (done) {
      this.timeout(5000);
      request.get('/connect')
        .auth('unknown_user@example.com', 'wrongpassword', { type: 'basic' })
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done();
        });
    });

    it('Fails with valid email but incorrect password', function (done) {
      this.timeout(5000);
      request.get('/connect')
        .auth(testUser.email, 'invalidpassword', { type: 'basic' })
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done();
        });
    });

    it('Fails with invalid email but correct password', function (done) {
      this.timeout(5000);
      request.get('/connect')
        .auth('fake_user@example.com', testUser.password, { type: 'basic' })
        .expect(401)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done();
        });
    });

    it('Succeeds for valid user credentials', function (done) {
      this.timeout(5000);
      request.get('/connect')
        .auth(testUser.email, testUser.password, { type: 'basic' })
        .expect(200)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body.token).to.exist;
          expect(res.body.token.length).to.be.greaterThan(0);
          authToken = res.body.token;
          done();
        });
    });
  });

  describe('GET: /disconnect Endpoint', () => {
    it('Fails when "X-Token" header is missing', function (done) {
      this.timeout(5000);
      request.get('/disconnect')
        .expect(401)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done();
        });
    });

    it('Fails for invalid "X-Token" value', function (done) {
      this.timeout(5000);
      request.get('/disconnect')
        .set('X-Token', 'invalid_token')
        .expect(401)
        .end((requestErr, res) => {
          if (requestErr) {
            return done(requestErr);
          }
          expect(res.body).to.deep.eql({ error: 'Unauthorized' });
          done();
        });
    });

    it('Succeeds with valid "X-Token" value', function (done) {
      request.get('/disconnect')
        .set('X-Token', authToken)
        .expect(204)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          expect(res.body).to.deep.eql({});
          expect(res.text).to.eql('');
          expect(res.headers['content-type']).to.not.exist;
          expect(res.headers['content-length']).to.not.exist;
          done();
        });
    });
  });
});