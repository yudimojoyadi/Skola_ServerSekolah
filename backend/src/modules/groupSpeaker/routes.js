const router = require('express').Router();
const c = require('./controller');

router.get('/', c.getAllGroupSpeakers);
router.post('/', c.createGroupSpeaker);
router.put('/:id', c.updateGroupSpeaker);
router.delete('/:id', c.deleteGroupSpeaker);

module.exports = router;
