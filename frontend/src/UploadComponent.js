import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

function UploadComponent({ onUpload }) {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      onUpload(acceptedFiles[0]);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: { 'image/*': ['.jpeg', '.png', '.jpg'] } 
  });

  return (
    <div className="upload-container">
      <h1>Görsel İçerikler için Deepfake Tespiti </h1>
      <p>AI ile oluşturulmuş görselleri ve deepfake içerikleri tespit et.</p>
      
      <div {...getRootProps()} className={`dropzone ${isDragActive ? 'active' : ''}`}>
        <input {...getInputProps()} />
        {
          isDragActive ?
            <p>Görseli şimdi bırakabilirsiniz...</p> :
            <p>Analiz için bir görseli buraya sürükleyin veya tıklayarak seçin</p>
        }
      </div>
      <p className="footer-text">
        Bu platform, "Görsel İçeriklerde Deepfake Tespiti İçin Yapay Zekâ Tabanlı Web Platform Geliştirilmesi" başlıklı lisans tezi kapsamında geliştirilmektedir.
      </p>
    </div>
  );
}

export default UploadComponent;