import axios from 'axios';

// 1MB chunk size
// A safer bet than 4MB because Vercel Serverless has a 10s or 60s timeout depending on plan.
// 1MB of mp3 is approx 1 min. Whisper usually transcribes 1 min in < 10s.
const CHUNK_SIZE = 1 * 1024 * 1024;

export const transcribeAudio = async (file, onProgress) => {
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
  let completeTranscription = '';
  // Keep track of the last few words to provide context for the next chunk
  let previousContext = '';

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE;
    const end = Math.min(file.size, start + CHUNK_SIZE);
    const chunk = file.slice(start, end);

    // Create a proper file object for the chunk so the backend receives it with a name
    // The backend uses 'formidable' which expects a filename for uploads
    const extension = file.name.split('.').pop();
    const chunkFile = new File([chunk], `chunk-${i}.${extension}`, { type: file.type });

    const formData = new FormData();
    formData.append('file', chunkFile);
    if (previousContext) {
      formData.append('prompt', previousContext);
    }

    try {
      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const text = response.data.text;

      // Accumulate text (add a space if needed)
      if (completeTranscription && text) {
        completeTranscription += ' ' + text;
      } else {
        completeTranscription += text;
      }

      // Update context: grab the last 200 chars to help Whisper with the next sentence
      // This prevents cut-off words or lost context at the split point
      if (completeTranscription.length > 200) {
        previousContext = completeTranscription.slice(-200);
      } else {
        previousContext = completeTranscription;
      }

      // Notify UI
      if (onProgress) {
        const percent = Math.round(((i + 1) / totalChunks) * 100);
        onProgress(percent);
      }

    } catch (error) {
      console.error(`Error transcribing chunk ${i}:`, error);
      // We could retry here, but for now let's fail
      if (error.response) {
        throw new Error(error.response.data.error || `Failed to transcribe part ${i + 1}.`);
      }
      throw new Error('Network error or server issue during chunked upload.');
    }
  }

  return completeTranscription;
};
