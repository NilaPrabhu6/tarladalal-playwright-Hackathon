const fs = require('fs');
const path = require('path');
const { pool } = require('../utils/dbClient');

(async () => {
  const schemaPath = path.resolve(__dirname, '../db/schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(schema);
  await pool.end();
  console.log('Database table recipe_results is ready.');
})().catch(error => {
  console.error('DB initialization failed:', error);
  process.exit(1);
});
