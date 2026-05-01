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
    const siswa = await db.student.findUnique({
      where: { qrCode: qr_code }
    });

    if (!siswa) {
      return res.status(404).json({ message: 'QR tidak ditemukan' });
    }

    // ✅ ANTI DOUBLE SCAN (10 detik)
    const recent = await db.nodeLog.findFirst({
      where: {
        qrCode: qr_code,
        createdAt: { gt: new Date(Date.now() - 10000) }
      }
    });

    if (recent) {
      return res.json({ message: 'Duplicate scan ignored' });
    }

    // ✅ GENERATE AUDIO
    const text = `Ananda ${siswa.nama} di tunggu di lobby`;
    const filename = `${siswa.id}.mp3`;

    const audioUrl = await tts.generate(text, filename);

    // ✅ INSERT LOG
    await db.nodeLog.create({
      data: {
        nodeId: parseInt(node_id),
        qrCode: qr_code,
        status: 'PROCESS'
      }
    });

    // ✅ PILIH GROUP SPEAKER
    const group = await db.speakerGroup.findFirst({
      where: { kelas: siswa.kelas }
    });

    const topic = `speaker/${group.groupName}`;

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