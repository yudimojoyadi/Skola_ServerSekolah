const db = require('../../config/db');

exports.summary = async (req, res) => {
  const nodes = await db.node.findMany();

  const result = nodes.map(node => ({
    id: node.id,
    name: node.name,
    type: node.type,
    status: node.lastHeartbeat && new Date(node.lastHeartbeat) > new Date(Date.now() - 30000) ? 'online' : 'offline',
    last_heartbeat: node.lastHeartbeat
  }));

  res.json(result);
};