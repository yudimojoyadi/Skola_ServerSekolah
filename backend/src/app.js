const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(cors({
  origin: '*'
}));
app.use(express.json());

app.use('/auth', require('./modules/auth/routes'));
app.use('/node', require('./modules/node/routes'));
app.use('/scan', require('./modules/scan/routes'));
app.use('/monitoring', require('./modules/monitoring/routes'));
app.use('/students', require('./modules/student/routes'));
app.use('/audio', require('./modules/audio/routes'));
app.use('/room', require('./modules/room/routes'));
app.use('/group-speaker', require('./modules/groupSpeaker/routes'));
app.use(express.static(path.join(__dirname, '../public')));

module.exports = app;