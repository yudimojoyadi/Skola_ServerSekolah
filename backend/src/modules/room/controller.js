const db = require('../../config/db');

exports.getAllRooms = async (req, res) => {
  try {
    const rooms = await db.room.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    res.json(rooms);
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.createRoom = async (req, res) => {
  try {
    const { name, createdBy } = req.body;

    const room = await db.room.create({
      data: {
        name,
        createdBy: createdBy ? parseInt(createdBy) : null
      },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });

    res.json(room);
  } catch (error) {
    console.error('Error creating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateRoom = async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    
    const room = await db.room.update({
      where: { id: parseInt(id) },
      data: { name },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    res.json(room);
  } catch (error) {
    console.error('Error updating room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteRoom = async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.room.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting room:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
