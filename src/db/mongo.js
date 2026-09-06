const { MongoClient } = require('mongodb');

let client;
let db;

async function connect() {
  if (db) return db;

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI is not set. Add it as a Railway environment variable.');
  }

  client = new MongoClient(uri);
  await client.connect();

  db = client.db(process.env.MONGODB_DB_NAME || 'football_betting');

  console.log(`[mongo] connected to database: ${db.databaseName}`);
  return db;
}

async function close() {
  if (client) await client.close();
}

module.exports = { connect, close };
