const router = require('express').Router();
const c = require('./controller');

router.get('/', c.getAllRooms);
router.post('/', c.createRoom);
router.put('/:id', c.updateRoom);
router.delete('/:id', c.deleteRoom);

module.exports = router;
