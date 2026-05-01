const express = require('express');
const router = express.Router();
const { generateAudio } = require('./controller');

router.post('/generate', generateAudio);

module.exports = router;
