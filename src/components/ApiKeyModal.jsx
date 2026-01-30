import React, { useState } from 'react';
import { Key } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

const ApiKeyModal = ({ isOpen, onSave, onClose }) => {
    const [key, setKey] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (key.trim().startsWith('sk-')) {
            onSave(key.trim());
        } else {
            alert('Please enter a valid OpenAI API key starting with sk-');
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className="modal-content glass-panel"
                        initial={{ scale: 0.95, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 20 }}
                    >
                        <div className="modal-header">
                            <div className="icon-badge">
                                <Key size={24} color="#fbbf24" />
                            </div>
                            <h2>OpenAI API Key</h2>
                        </div>
                        <p>To use Aurum Transcription, you need to provide your own OpenAI API key. It is stored locally in your browser and never sent to our servers.</p>

                        <form onSubmit={handleSubmit}>
                            <input
                                type="password"
                                placeholder="sk-..."
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                                className="input-field"
                                autoFocus
                            />
                            <div className="modal-actions">
                                <button type="submit" className="btn-primary">
                                    Save Key
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default ApiKeyModal;
