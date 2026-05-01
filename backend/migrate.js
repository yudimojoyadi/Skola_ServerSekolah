const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const client = new Client({
  host: '127.0.0.1',
  port: 5432,
  user: 'wahyudi',
  password: 's3mangat45',
  database: 'skola_local'
});

// SQL files in execution order (respecting dependencies)
const sqlFiles = [
  'users.sql',
  'student.sql',
  'nodes.sql',
  'speaker_groups.sql',
  'node_logs.sql'
];

async function migrate() {
  try {
    console.log('Connecting to PostgreSQL...');
    await client.connect();
    console.log('Connected successfully!');

    for (const file of sqlFiles) {
      const filePath = path.join(__dirname, 'db', file);
      console.log(`\nExecuting ${file}...`);
      
      const sql = fs.readFileSync(filePath, 'utf8');
      await client.query(sql);
      console.log(`✓ ${file} executed successfully`);
    }

    console.log('\n✅ All migrations completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
    console.log('\nConnection closed.');
  }
}

migrate();
