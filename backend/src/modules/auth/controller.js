const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await db.user.findUnique({
    where: { email }
  });

  if (!user) return res.status(401).json({});

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return res.status(401).json({});

  const token = jwt.sign({
    id: user.id,
    role: user.role
  }, process.env.JWT_SECRET);

  res.json({ token });
};