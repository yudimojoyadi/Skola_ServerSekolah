const db = require('../../config/db');
const io = require('../../realtime/socket');
const mqtt = require('../../config/mqtt');
const tts = require('../../services/tts');
const { v4: uuidv4 } = require('uuid');

exports.scan = async (req, res) => {
  try {
    const { qr_code, node_id } = req.body;

    if (!qr_code || !node_id) {
      return res.status(400).json({ message: 'Invalid payload' });
    }

    // ✅ VALIDASI SISWA
    const studentRes = await db.query(
      `SELECT * FROM students WHERE qr_code=$1`,
      [qr_code]
    );

    if (!studentRes.rows.length) {
      return res.status(404).json({ message: 'QR tidak ditemukan' });
    }

    const siswa = studentRes.rows[0];

    // ✅ ANTI DOUBLE SCAN (10 detik)
    const recent = await db.query(`
      SELECT * FROM node_logs
      WHERE qr_code=$1
      AND created_at > NOW() - INTERVAL '10 seconds'
    `, [qr_code]);

    if (recent.rows.length) {
      return res.json({ message: 'Duplicate scan ignored' });
    }

    // ✅ GENERATE AUDIO
    const text = `Ananda ${siswa.nama} di tunggu di lobby`;
    const filename = `${siswa.id}.mp3`;

    const audioUrl = await tts.generate(text, filename);

    // ✅ INSERT LOG
    await db.query(`
      INSERT INTO node_logs(node_id, qr_code, status)
      VALUES ($1,$2,$3)
    `, [node_id, qr_code, 'PROCESS']);

    // ✅ PILIH GROUP SPEAKER
    const group = await db.query(
      `SELECT group_name FROM speaker_groups WHERE kelas=$1`,
      [siswa.kelas]
    );

    const topic = `speaker/${group.rows[0].group_name}`;

    // ✅ MQTT PUBLISH
    mqtt.publish(topic, JSON.stringify({
      id: uuidv4(),
      qr_code,
      siswa_id: siswa.id,
      audio_url: `http://localhost:3000${audioUrl}`
    }));

    // ✅ REALTIME DASHBOARD
    io.get().emit('scan:new', {
      siswa,
      audio: audioUrl
    });

    res.json({
      success: true,
      siswa,
      audio_url: audioUrl
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};