import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, Music, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const FileUploader = ({ onFileSelected, disabled }) => {
    const onDrop = useCallback((acceptedFiles, fileRejections) => {
        if (fileRejections.length > 0) {
            const file = fileRejections[0].file;
            alert(`Invalid file type (${file.type}). Please upload MP3, WAV, or M4A files.`);
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
            'audio/wav': ['.wav'],
            'audio/mp4': ['.m4a'],
            'audio/x-m4a': ['.m4a'],
            'audio/m4a': ['.m4a'],
            'video/mp4': ['.m4a']
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
                <p>Supported formats: MP3, WAV, M4A (No size limit)</p>
            </div>
        </motion.div>
    );
};

export default FileUploader;
