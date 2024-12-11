/* eslint-disable import/no-named-as-default */
import databaseClient from "../../utils/db";

describe("User Controller Tests", () => {
  const sampleUser = {
    email: "luffy@strawhat.com",
    password: "gear5_gomu_gomu",
  };

  before(function (done) {
    this.timeout(10000); // Extend timeout for setup
    databaseClient
      .usersCollection()
      .then((usersCollection) =>
        usersCollection.deleteMany({ email: sampleUser.email })
      )
      .then(() => done())
      .catch((err) => done(err));
    setTimeout(done, 5000); // Additional delay for setup
  });

  describe("POST: /users Endpoint", () => {
    it("Should fail if password is provided without an email", function (done) {
      this.timeout(5000);
      request
        .post("/users")
        .send({ password: sampleUser.password })
        .expect(400)
        .end((error, response) => {
          if (error) return done(error);
          expect(response.body).to.deep.equal({ error: "Missing email" });
          done();
        });
    });

    it("Should fail if email is provided without a password", function (done) {
      this.timeout(5000);
      request
        .post("/users")
        .send({ email: sampleUser.email })
        .expect(400)
        .end((error, response) => {
          if (error) return done(error);
          expect(response.body).to.deep.equal({ error: "Missing password" });
          done();
        });
    });

    it("Should succeed when a valid email and password are provided", function (done) {
      this.timeout(5000);
      request
        .post("/users")
        .send({ email: sampleUser.email, password: sampleUser.password })
        .expect(201)
        .end((error, response) => {
          if (error) return done(error);
          expect(response.body.email).to.equal(sampleUser.email);
          expect(response.body.id).to.have.length.greaterThan(0);
          done();
        });
    });

    it("Should fail if the user already exists", function (done) {
      this.timeout(5000);
      request
        .post("/users")
        .send({ email: sampleUser.email, password: sampleUser.password })
        .expect(400)
        .end((error, response) => {
          if (error) return done(error);
          expect(response.body).to.deep.equal({ error: "Already exist" });
          done();
        });
    });
  });
});