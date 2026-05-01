const express = require('express');
const router = express.Router();
const { getAllStudents } = require('./controller');

router.get('/', getAllStudents);

module.exports = router;
