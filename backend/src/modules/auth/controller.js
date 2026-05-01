const db = require('../../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await db.query(`SELECT * FROM users WHERE email=$1`, [email]);

  if (!user.rows.length) return res.status(401).json({});

  const valid = await bcrypt.compare(password, user.rows[0].password);
  if (!valid) return res.status(401).json({});

  const token = jwt.sign({
    id: user.rows[0].id,
    role: user.rows[0].role
  }, process.env.JWT_SECRET);

  res.json({ token });
};