const db = require('../../config/db');

exports.heartbeat = async (req, res) => {
  try {
    console.log('Heartbeat received:', req.body);
    const { node_id, status } = req.body;

    if (!node_id) {
      console.log('Heartbeat failed: node_id is required');
      return res.status(400).json({ message: 'node_id is required' });
    }

    console.log('Updating node with id:', parseInt(node_id));
    // Update node's last heartbeat, create if doesn't exist
    const node = await db.node.upsert({
      where: { id: parseInt(node_id) },
      update: {
        lastHeartbeat: new Date(),
        status: status || 'online'
      },
      create: {
        id: parseInt(node_id),
        name: `Node ${node_id}`,
        type: 'scanner',
        ipAddress: req.ip || 'unknown',
        lastHeartbeat: new Date(),
        status: status || 'online',
        isEnable: true
      }
    });

    console.log('Heartbeat success for node:', node_id);
    res.json({
      success: true,
      node_id: node.id,
      last_heartbeat: node.lastHeartbeat,
      status: node.status
    });
  } catch (error) {
    console.error('Heartbeat error:', error.message);
    console.error('Error details:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

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