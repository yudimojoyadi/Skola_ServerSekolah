const router = require('express').Router();
const c = require('./controller');

router.get('/', c.getAllNodes);
router.post('/', c.createNode);
router.put('/:id', c.updateNode);
router.delete('/:id', c.deleteNode);
router.post('/heartbeat', c.heartbeat);
router.post('/feedback', c.feedback);

module.exports = router;