const fs = require('fs');
const path = require('path');
const textToSpeech = require('@google-cloud/text-to-speech');

const client = new textToSpeech.TextToSpeechClient();

exports.generate = async (text, filename) => {
  const filePath = path.join(__dirname, '../../public/audio', filename);

  if (fs.existsSync(filePath)) {
    return `/audio/${filename}`;
  }

  const request = {
    input: { text },
    voice: { languageCode: 'id-ID', ssmlGender: 'FEMALE' },
    audioConfig: { audioEncoding: 'MP3' }
  };

  const [response] = await client.synthesizeSpeech(request);

  fs.writeFileSync(filePath, response.audioContent, 'binary');

  return `/audio/${filename}`;
};