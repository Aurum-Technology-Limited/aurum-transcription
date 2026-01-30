import axios from 'axios';

export const transcribeAudio = async (file, apiKey) => {
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const formData = new FormData();
  formData.append('file', file);
  formData.append('model', 'whisper-1');

  try {
    const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    if (error.response) {
      throw new Error(error.response.data.error.message || 'Failed to transcribe audio on the server side.');
    }
    throw new Error('Network error or invalid API key.');
  }
};
