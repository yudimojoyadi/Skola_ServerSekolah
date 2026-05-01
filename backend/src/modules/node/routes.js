const router = require('express').Router();
const c = require('./controller');

router.get('/', c.getAllNodes);
router.post('/heartbeat', c.heartbeat);
router.post('/feedback', c.feedback);

module.exports = router;