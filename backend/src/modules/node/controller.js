const db = require('../../config/db');
const io = require('../../realtime/socket');

exports.heartbeat = async (req, res) => {
  const { node_id } = req.body;

  await db.node.update({
    where: { id: node_id },
    data: { lastHeartbeat: new Date() }
  });

  io.get().emit('node:heartbeat', { node_id });

  res.json({ success: true });
};

exports.feedback = async (req, res) => {
  const { qr_code, node_id, status } = req.body;

  await db.nodeLog.updateMany({
    where: { qrCode: qr_code },
    orderBy: { createdAt: 'desc' },
    take: 1,
    data: { status }
  });

  const io = require('../../realtime/socket');

  io.get().emit('node:feedback', {
    qr_code,
    node_id,
    status
  });

  res.json({ success: true });
};