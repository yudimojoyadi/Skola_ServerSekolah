const router = require('express').Router();
const c = require('./controller');

router.post('/login', c.login);

module.exports = router;