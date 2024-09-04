const { MongoClient } = require('mongodb');

const database = process.env.DB_DATABASE || 'files_manager';
const port = process.env.DB_PORT || 27017;
const host = process.env.DB_HOST || 'localhost';
const url = `mongodb://${host}:${port}`;

class DBClient {
  constructor() {
    MongoClient.connect(url, (err, client) => {
      if (!err) {
        this.db = client.db(database);
      } else {
        this.db = false;
      }
    });
  }

  isAlive() {
    if (this.db) return true;
    return false;
  }

  async nbFiles() {
    return this.db.collection('files').countDocuments();
  }

  async nbUsers() {
    return this.db.collection('users').countDocuments();
  }
}

const dbClient = new DBClient();
export default dbClient;
