import React, { useState, useEffect } from 'react';
import { Settings, FileAudio, Trash2, Mic, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';


import FileUploader from './components/FileUploader';
import TranscriptionEditor from './components/TranscriptionEditor';
import ExportActions from './components/ExportActions';
import { transcribeAudio } from './services/openaiService';

function App() {
  const [file, setFile] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [status, setStatus] = useState('idle'); // idle, transcribing, completed, error
  const [errorDetails, setErrorDetails] = useState('');
  const [progress, setProgress] = useState(0);



  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStatus('idle');
    setTranscription('');
    setErrorDetails('');
  };

  const handleRemoveFile = () => {
    setFile(null);
    setTranscription('');
    setStatus('idle');
    setErrorDetails('');
  };

  const handleTranscribe = async () => {
    if (!file) return;

    setStatus('transcribing');
    setErrorDetails('');
    setProgress(0);

    try {
      const text = await transcribeAudio(file, (percent) => {
        setProgress(percent);
      });
      setTranscription(text);
      setStatus('completed');
    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorDetails(err.message);
    }
  };

  return (
    <div className="container">


      <header className="app-header">
        <div className="brand">
          <div style={{ background: 'var(--primary)', padding: '8px', borderRadius: '8px' }}>
            <Mic color="#000" size={24} />
          </div>
          <h1 className="logo-text">Aurum <span>Transcription</span></h1>
        </div>

      </header>

      <main>
        <AnimatePresence mode='wait'>
          {!file ? (
            <motion.div
              key="uploader"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <FileUploader onFileSelected={handleFileSelect} />
            </motion.div>
          ) : (
            <motion.div
              key="file-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="file-card glass-panel">
                <div className="file-info">
                  <FileAudio size={32} color="var(--primary)" />
                  <div>
                    <h3 style={{ fontWeight: 500 }}>{file.name}</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  {status === 'idle' && (
                    <button className="btn-primary" onClick={handleTranscribe}>
                      <Play size={18} style={{ marginRight: '8px', display: 'inline' }} />
                      Transcribe
                    </button>
                  )}
                  <button
                    className="btn-secondary"
                    onClick={handleRemoveFile}
                    disabled={status === 'transcribing'}
                  >
                    <Trash2 size={18} color={status === 'transcribing' ? 'gray' : '#ef4444'} />
                  </button>
                </div>
              </div>

              {status === 'transcribing' && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  style={{ textAlign: 'center', padding: '3rem' }}
                >
                  <p style={{ marginBottom: '1rem', color: 'var(--primary)' }}>
                    Transcribing... {progress}%
                  </p>
                  <div className="loading-bar">
                    <div
                      className="loading-progress"
                      style={{ width: `${progress}%`, animation: 'none', transition: 'width 0.3s ease' }}
                    ></div>
                  </div>
                </motion.div>
              )}

              {status === 'error' && (
                <motion.div
                  className="glass-panel"
                  style={{ padding: '2rem', marginTop: '2rem', borderColor: '#ef4444' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <h3 style={{ color: '#ef4444', marginBottom: '0.5rem' }}>Transcription Failed</h3>
                  <p>{errorDetails}</p>
                  <button className="btn-secondary" style={{ marginTop: '1rem' }} onClick={handleTranscribe}>Try Again</button>
                </motion.div>
              )}

              {(status === 'completed' || transcription) && (
                <>
                  <TranscriptionEditor
                    text={transcription}
                    onChange={setTranscription}
                  />
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <ExportActions text={transcription} />
                  </motion.div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
