const prisma = require('../../config/db');

const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany({
      include: {
        audioFiles: true,
        room: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const createStudent = async (req, res) => {
  try {
    const { nama, kelas, roomId, qrCode } = req.body;
    
    // Generate base32 QR Code from date+time+name if not provided
    let generatedQrCode = qrCode;
    if (!generatedQrCode) {
      const now = new Date();
      const dateTimeStr = now.toISOString().replace(/[-:T.]/g, ''); // YYYYMMDDHHmmss
      const nameStr = nama.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); // Remove special chars
      const combined = dateTimeStr + nameStr;
      
      // Base32 encoding with format XXXX-XXXX-XXXX-XXXX
      generatedQrCode = toBase32Formatted(combined);
    }
    
    const student = await prisma.student.create({
      data: {
        nama,
        kelas,
        qrCode: generatedQrCode,
        roomId: parseInt(roomId)
      },
      include: {
        room: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.json(student);
  } catch (error) {
    console.error('Error creating student:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'QR Code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Base32 encoding with format XXXX-XXXX-XXXX-XXXX
function toBase32Formatted(str) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let result = '';
  let bits = 0;
  let value = 0;
  
  for (let i = 0; i < str.length; i++) {
    value = (value << 8) | str.charCodeAt(i);
    bits += 8;
    
    while (bits >= 5) {
      result += alphabet[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  
  if (bits > 0) {
    result += alphabet[(value << (5 - bits)) & 31];
  }
  
  // Pad or trim to 16 characters, then format as XXXX-XXXX-XXXX-XXXX
  if (result.length < 16) {
    result = result.padEnd(16, 'A');
  } else if (result.length > 16) {
    result = result.substring(0, 16);
  }
  
  return result.match(/.{1,4}/g).join('-');
}

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, kelas, qrCode, roomId } = req.body;
    
    // Generate base32 QR Code from date+time+name if not provided
    let generatedQrCode = qrCode;
    if (!generatedQrCode && nama) {
      const now = new Date();
      const dateTimeStr = now.toISOString().replace(/[-:T.]/g, ''); // YYYYMMDDHHmmss
      const nameStr = nama.replace(/[^a-zA-Z0-9]/g, '').toUpperCase(); // Remove special chars
      const combined = dateTimeStr + nameStr;
      
      // Base32 encoding with format XXXX-XXXX-XXXX-XXXX
      generatedQrCode = toBase32Formatted(combined);
    }
    
    const student = await prisma.student.update({
      where: { id: parseInt(id) },
      data: {
        nama,
        kelas,
        qrCode: generatedQrCode,
        roomId: parseInt(roomId)
      },
      include: {
        room: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    res.json(student);
  } catch (error) {
    console.error('Error updating student:', error);
    if (error.code === 'P2002') {
      return res.status(400).json({ error: 'QR Code already exists' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.student.delete({
      where: { id: parseInt(id) }
    });
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting student:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllStudents,
  createStudent,
  updateStudent,
  deleteStudent
};
