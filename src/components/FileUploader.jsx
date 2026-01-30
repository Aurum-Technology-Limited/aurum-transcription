import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Music, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const FileUploader = ({ onFileSelected, disabled }) => {
    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        if (fileRejections.length > 0) {
            alert('Invalid file type. Please upload MP3 or WAV files.');
            return;
        }
        if (acceptedFiles?.length > 0) {
            onFileSelected(acceptedFiles[0]);
        }
    }, [onFileSelected]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'audio/mpeg': ['.mp3'],
            'audio/wav': ['.wav']
        },
        maxFiles: 1,
        disabled
    });

    return (
        <motion.div
            {...getRootProps()}
            className={clsx(
                "upload-zone glass-panel",
                isDragActive && "active",
                disabled && "disabled"
            )}
            whileHover={!disabled ? { scale: 1.01, borderColor: 'var(--primary)' } : {}}
            whileTap={!disabled ? { scale: 0.99 } : {}}
        >
            <input {...getInputProps()} />
            <div className="upload-content">
                <div className={clsx("icon-circle", isDragActive && "active")}>
                    {isDragActive ? (
                        <UploadCloud size={48} color="#0a0a0a" />
                    ) : (
                        <Music size={48} color="var(--primary)" />
                    )}
                </div>
                <h3>
                    {isDragActive ? "Drop audio file here" : "Drag & drop audio file"}
                </h3>
                <p>Supported formats: MP3, WAV (Max 25MB)</p>
            </div>
        </motion.div>
    );
};

export default FileUploader;
