import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import DBClient from '../utils/db';
import RedisClient from '../utils/redis';

class AuthController {
  static async getConnect(req, res) {
    const auth = req.header('Authorization') || null;

    if (!auth) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const buffery = Buffer.from(auth.replace('Basic ', ''), 'base64');

    const credentials = {
      email: buffery.toString('utf-8').split(':')[0],
      password: buffery.toString('utf-8').split(':')[1],
    };

    if (!credentials.email || !credentials.password) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    credentials.password = sha1(credentials.password);

    const userExists = await DBClient.db
      .collection('users')
      .findOne(credentials);
    if (!userExists) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const tk = uuidv4();
    const key = `auth_${tk}`;
    await RedisClient.set(key, userExists._id.toString(), 86400);

    return res.status(200).send({ tk });
  }

  static async getDisconnect(req, res) {
    const tk = req.header('X-Token') || null;

    if (!tk) return res.status(401).send({ error: 'Unauthorized' });

    const redisTok = await RedisClient.get(`auth_${tk}`);

    if (!redisTok) return res.status(401).send({ error: 'Unauthorized' });

    await RedisClient.del(`auth_${tk}`);

    return res.status(204).send();
  }
}

module.exports = AuthController;
