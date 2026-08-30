import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

async function run() {
  const connectionUrl = 'mysql://root:ZsNZoXtZdYIePkjPgdWNwXyBTlJZfZth@switchback.proxy.rlwy.net:35569/railway';
  const connection = await mysql.createConnection({
    uri: connectionUrl,
    multipleStatements: true
  });

  const schemaPath = path.join(__dirname, '../src/config/schema.sql');
  const schemaSql = fs.readFileSync(schemaPath, 'utf8');

  console.log('Executing schema...');
  await connection.query(schemaSql);
  console.log('Schema executed successfully on Railway!');
  await connection.end();
}

run().catch(console.error);
