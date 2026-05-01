const express = require('express');
const router = express.Router();
const { summary } = require('./controller');

router.get('/summary', summary);

module.exports = router;
