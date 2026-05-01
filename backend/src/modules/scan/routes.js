const router = require('express').Router();
const controller = require('./controller');

router.post('/', controller.scan);

module.exports = router;