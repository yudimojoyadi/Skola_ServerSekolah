const db = require('../../config/db');
const io = require('../../realtime/socket');

exports.getAllNodes = async (req, res) => {
  try {
    const nodes = await db.node.findMany();
    res.json(nodes);
  } catch (error) {
    console.error('Error fetching nodes:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createNode = async (req, res) => {
  try {
    const { name, type, ipAddress, isEnable } = req.body;
    
    // Check if IP address already exists
    const existingNode = await db.node.findUnique({
      where: { ipAddress }
    });
    
    if (existingNode) {
      return res.status(400).json({ error: 'IP address already exists' });
    }
    
    const node = await db.node.create({
      data: {
        name,
        type,
        ipAddress,
        isEnable: isEnable !== undefined ? isEnable : true
      }
    });
    
    res.json(node);
  } catch (error) {
    console.error('Error creating node:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'IP address already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateNode = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, ipAddress, isEnable } = req.body;
    
    // Check if IP address already exists (excluding current node)
    const existingNode = await db.node.findFirst({
      where: {
        ipAddress: ipAddress,
        id: { not: parseInt(id) }
      }
    });
    
    if (existingNode) {
      return res.status(400).json({ error: 'IP address already exists' });
    }
    
    const node = await db.node.update({
      where: { id: parseInt(id) },
      data: {
        name,
        type,
        ipAddress,
        isEnable: isEnable !== undefined ? isEnable : true
      }
    });
    
    res.json(node);
  } catch (error) {
    console.error('Error updating node:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'IP address already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteNode = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.node.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting node:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.heartbeat = async (req, res) => {
  const { node_id } = req.body;

  await db.node.update({
    where: { id: parseInt(node_id) },
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