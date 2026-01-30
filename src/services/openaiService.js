import axios from 'axios';

export const transcribeAudio = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  // model is now handled on the server

  try {
    const response = await axios.post('/api/transcribe', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.text;
  } catch (error) {
    console.error('Error transcribing audio:', error);
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to transcribe audio.');
    }
    throw new Error('Network error or server issue.');
  }
};

