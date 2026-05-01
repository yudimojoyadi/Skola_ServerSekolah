const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getAllScanLogs = async (req, res) => {
  try {
    const scanLogs = await prisma.scanLog.findMany({
      include: {
        student: {
          select: {
            id: true,
            nama: true,
            kelas: true,
            qrCode: true
          }
        },
        node: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(scanLogs);
  } catch (error) {
    console.error('Error fetching scan logs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllScanLogs
};
