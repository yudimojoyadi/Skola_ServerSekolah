const db = require('../../config/db');

exports.summary = async (req, res) => {
  const result = await db.query(`
    SELECT id, name, type,
    CASE WHEN last_heartbeat > NOW() - INTERVAL '30 sec'
      THEN 'online' ELSE 'offline' END status,
    last_heartbeat
    FROM nodes
  `);

  res.json(result.rows);
};