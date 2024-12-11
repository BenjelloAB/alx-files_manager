/* eslint-disable import/no-named-as-default */
import { expect } from 'chai';
import redisUtility from '../../utils/redis';

describe('Redis Utility Tests', () => {
  before(function (done) {
    this.timeout(10000); // Extend the default timeout to accommodate setup
    setTimeout(done, 4000); // Simulating a delay for initialization
  });

  it('Should verify that the Redis client is operational', () => {
    expect(redisUtility.isAlive()).to.be.true;
  });

  it('Should set and retrieve a key-value pair', async function () {
    await redisUtility.set('sample_key', 123, 10); // Set key with expiration
    expect(await redisUtility.get('sample_key')).to.equal('123'); // Verify value
  });

  it('Should set a value with expiration and validate it expires', async function () {
    await redisUtility.set('temp_key', 456, 1); // Set key with short expiration
    setTimeout(async () => {
      expect(await redisUtility.get('temp_key')).to.not.equal('456'); // Check if expired
    }, 2000);
  });

  it('Should delete a key and ensure it no longer exists', async function () {
    await redisUtility.set('remove_key', 789, 10); // Set key
    await redisUtility.del('remove_key'); // Delete key
    setTimeout(async () => {
      console.log('Deleted key value ->', await redisUtility.get('remove_key'));
      expect(await redisUtility.get('remove_key')).to.be.null; // Validate deletion
    }, 2000);
  });
});