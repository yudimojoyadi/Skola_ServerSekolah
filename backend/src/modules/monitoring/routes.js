const express = require('express');
const router = express.Router();
const { summary, heartbeat } = require('./controller');

router.get('/summary', summary);
router.post('/heartbeat', heartbeat);

module.exports = router;
