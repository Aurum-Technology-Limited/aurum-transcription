import axios from 'axios';

// 1MB chunk size
// A safer bet than 4MB because Vercel Serverless has a 10s or 60s timeout depending on plan.
// 1MB of mp3 is approx 1 min. Whisper usually transcribes 1 min in < 10s.
// Vercel serverless function body size limit is 4.5MB.
// We set a slightly lower limit to be safe.
const MAX_FILE_SIZE_LIMIT = 4.2 * 1024 * 1024;
const CHUNK_SIZE = 1 * 1024 * 1024;

export const transcribeAudio = async (file, onProgress) => {
  const extension = file.name.split('.').pop().toLowerCase();
  const isContainerFormat = ['m4a', 'mp4'].includes(extension);

  // If it's a container format (m4a/mp4), we CANNOT chunk it naively as it corrupts the file.
  if (isContainerFormat) {
    if (file.size > MAX_FILE_SIZE_LIMIT) {
      throw new Error(`For .m4a/.mp4 files, the maximum file size is 4MB due to format limitations.`);
    }
    // Treat as a single chunk
    const formData = new FormData();
    formData.append('file', file);

    try {
      if (onProgress) onProgress(10); // Start progress

      const response = await axios.post('/api/transcribe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            // Map upload progress to 10-90% range to leave room for processing
            onProgress(10 + Math.round(percentCompleted * 0.8));
          }
        }
      });

      if (onProgress) onProgress(100);
      return response.data.text;

    } catch (error) {
      console.error(`Error transcribing file:`, error);
      if (error.response) {
        throw new Error(error.response.data.error || `Transcription failed.`);
      }
      throw new Error('Network error or server issue.');
    }
  }

  // Fallback to chunking for streamable formats (mp3, wav)
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
    const chunkFile = new File([chunk], `chunk-${i}.${extension}`, { type: file.type });

    let chunkRetryCount = 0;
    const MAX_RETRIES = 3;
    let chunkSuccess = false;

    while (!chunkSuccess && chunkRetryCount < MAX_RETRIES) {
      const formData = new FormData();
      formData.append('file', chunkFile);
      // Only attach prompt if it's not the last retry, just in case the prompt is causing issues
      if (previousContext && chunkRetryCount < MAX_RETRIES - 1) {
        formData.append('prompt', previousContext);
      }

      try {
        const response = await axios.post('/api/transcribe', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        const text = response.data.text;

        // Accumulate text
        if (completeTranscription && text) {
          completeTranscription += ' ' + text;
        } else {
          completeTranscription += text;
        }

        // Update context
        if (completeTranscription.length > 200) {
          previousContext = completeTranscription.slice(-200);
        } else {
          previousContext = completeTranscription;
        }

        chunkSuccess = true;

        // Notify UI
        if (onProgress) {
          const percent = Math.round(((i + 1) / totalChunks) * 100);
          onProgress(percent);
        }

      } catch (error) {
        console.error(`Error transcribing chunk ${i} (Attempt ${chunkRetryCount + 1}/${MAX_RETRIES}):`, error);
        chunkRetryCount++;

        if (chunkRetryCount >= MAX_RETRIES) {
          if (error.response) {
            throw new Error(error.response.data.error || `Failed to transcribe part ${i + 1}.`);
          }
          throw new Error('Network error or server issue during chunked upload.');
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * chunkRetryCount));
      }
    }
  }

  return completeTranscription;
};
