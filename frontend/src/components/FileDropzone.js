// src/components/FileDropzone.js
import React from 'react';
import { useDropzone } from 'react-dropzone';

const FileDropzone = ({ onDrop, visible }) => {
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => onDrop(acceptedFiles),
    accept: 'image/*', // Only accept images
  });

  if (!visible) return null;

  return (
    <div {...getRootProps()} style={dropzoneStyles}>
      <input {...getInputProps()} />
      <p>Drag & drop some files here, or click to select files</p>
    </div>
  );
};

const dropzoneStyles = {
  border: '2px dashed #888',
  padding: '20px',
  textAlign: 'center',
  cursor: 'pointer',
};

export default FileDropzone;
