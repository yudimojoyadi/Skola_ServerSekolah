const prisma = require('../../config/db');
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const crypto = require('crypto');

const generateAudio = async (req, res) => {
  try {
    const { studentId, textSource } = req.body;

    if (!studentId || !textSource) {
      return res.status(400).json({ error: 'studentId and textSource are required' });
    }

    // Generate random filename
    const randomString = crypto.randomBytes(16).toString('hex');
    const filename = `${randomString}.mp3`;
    const audioDir = path.join(__dirname, '../../../public/student/audio');
    const filePath = path.join(audioDir, filename);

    // Create directory if it doesn't exist
    if (!fs.existsSync(audioDir)) {
      fs.mkdirSync(audioDir, { recursive: true });
    }

    // Download audio from Google TTS API
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(textSource)}&tl=id&client=tw-ob`;
    const response = await axios({
      method: 'GET',
      url: audioUrl,
      responseType: 'arraybuffer'
    });

    // Save audio file
    fs.writeFileSync(filePath, response.data);

    // Generate server URL using request host
    const protocol = req.protocol;
    const host = req.get('host');
    const serverUrl = `${protocol}://${host}/student/audio/${filename}`;

    // Upsert: update if exists, create if not
    const audioFile = await prisma.audioFile.upsert({
      where: {
        studentId: parseInt(studentId)
      },
      update: {
        textSource,
        url: serverUrl,
        filePath: `/student/audio/${filename}`,
      },
      create: {
        studentId: parseInt(studentId),
        textSource,
        url: serverUrl,
        filePath: `/student/audio/${filename}`,
      }
    });

    res.json(audioFile);
  } catch (error) {
    console.error('Error generating audio:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  generateAudio
};
