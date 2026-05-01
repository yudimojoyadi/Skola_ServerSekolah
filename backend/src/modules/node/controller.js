const db = require('../../config/db');
const io = require('../../realtime/socket');

exports.heartbeat = async (req, res) => {
  const { node_id } = req.body;

  await db.query(
    `UPDATE nodes SET last_heartbeat=NOW() WHERE id=$1`,
    [node_id]
  );

  io.get().emit('node:heartbeat', { node_id });

  res.json({ success: true });
};

exports.feedback = async (req, res) => {
  const { qr_code, node_id, status } = req.body;

  await db.query(`
    UPDATE node_logs
    SET status=$1
    WHERE qr_code=$2
    ORDER BY created_at DESC
    LIMIT 1
  `, [status, qr_code]);

  const io = require('../../realtime/socket');

  io.get().emit('node:feedback', {
    qr_code,
    node_id,
    status
  });

  res.json({ success: true });
};