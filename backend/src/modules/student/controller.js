const prisma = require('../../config/db');

const getAllStudents = async (req, res) => {
  try {
    const students = await prisma.student.findMany();
    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAllStudents
};
