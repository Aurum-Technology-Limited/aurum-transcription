import React from 'react';
import { motion } from 'framer-motion';

const TranscriptionEditor = ({ text, onChange }) => {
    return (
        <motion.div
            className="editor-container glass-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
        >
            <div className="editor-header">
                <h3>Transcription</h3>
                <span className="badge">Editable</span>
            </div>
            <textarea
                className="transcription-textarea"
                value={text}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Transcription will appear here..."
                spellCheck={false}
            />
        </motion.div>
    );
};

export default TranscriptionEditor;
