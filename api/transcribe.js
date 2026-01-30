import { IncomingForm } from 'formidable';
import fs from 'fs';
import OpenAI from 'openai';

// Vercel Serverless Function config to disable body parsing (let formidable handle it)
export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured on server' });
    }

    const openai = new OpenAI({ apiKey });

    // Parse the multipart form data
    const form = new IncomingForm();

    // Set max file size slightly above 4.5MB to catch it on the server if needed, 
    // though Vercel might kill it sooner.
    form.maxFileSize = 5 * 1024 * 1024;

    try {
        const [fields, files] = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) return reject(err);
                resolve([fields, files]);
            });
        });

        // Validating file existence. 
        // Formidable might return an array or object depending on version/config.
        const file = Array.isArray(files.file) ? files.file[0] : files.file;

        if (!file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const transcription = await openai.audio.transcriptions.create({
            file: fs.createReadStream(file.filepath),
            model: "whisper-1",
        });

        return res.status(200).json({ text: transcription.text });

    } catch (error) {
        console.error('Transcription error:', error);
        return res.status(500).json({ error: 'Transcription failed: ' + error.message });
    }
}
