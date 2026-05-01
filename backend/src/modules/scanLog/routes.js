const express = require('express');
const router = express.Router();
const { getAllScanLogs } = require('./controller');

router.get('/', getAllScanLogs);

module.exports = router;
