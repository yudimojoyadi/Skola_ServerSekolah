const db = require('../../config/db');

exports.getAllGroupSpeakers = async (req, res) => {
  try {
    const groupSpeakers = await db.groupSpeaker.findMany({
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        room: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    res.json(groupSpeakers);
  } catch (error) {
    console.error('Error fetching group speakers:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createGroupSpeaker = async (req, res) => {
  try {
    const { name, nodeId, roomId, createdBy } = req.body;
    
    // Check if combination of nodeId and roomId already exists
    const existingGroupSpeaker = await db.groupSpeaker.findFirst({
      where: {
        nodeId: parseInt(nodeId),
        roomId: parseInt(roomId)
      }
    });
    
    if (existingGroupSpeaker) {
      return res.status(400).json({ error: 'This combination of Node and Room already exists' });
    }
    
    const groupSpeaker = await db.groupSpeaker.create({
      data: {
        name,
        nodeId: parseInt(nodeId),
        roomId: parseInt(roomId),
        createdBy: createdBy ? parseInt(createdBy) : null
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        room: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    res.json(groupSpeaker);
  } catch (error) {
    console.error('Error creating group speaker:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This combination of Node and Room already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateGroupSpeaker = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, nodeId, roomId } = req.body;
    
    // Check if combination of nodeId and roomId already exists (excluding current record)
    const existingGroupSpeaker = await db.groupSpeaker.findFirst({
      where: {
        nodeId: parseInt(nodeId),
        roomId: parseInt(roomId),
        id: { not: parseInt(id) }
      }
    });
    
    if (existingGroupSpeaker) {
      return res.status(400).json({ error: 'This combination of Node and Room already exists' });
    }
    
    const groupSpeaker = await db.groupSpeaker.update({
      where: { id: parseInt(id) },
      data: { 
        name, 
        nodeId: parseInt(nodeId), 
        roomId: parseInt(roomId) 
      },
      include: {
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        },
        room: {
          select: {
            id: true,
            name: true
          }
        },
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    res.json(groupSpeaker);
  } catch (error) {
    console.error('Error updating group speaker:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'This combination of Node and Room already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteGroupSpeaker = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.groupSpeaker.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting group speaker:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
