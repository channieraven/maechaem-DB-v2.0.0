import React, { useState, useRef } from 'react';
import { Upload, Loader2 } from 'lucide-react';
import supabase from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import type { ImageType, GalleryCategory } from '../../lib/database.types';

interface ImageUploadProps {
  plotId: string;
  imageType: ImageType;
  galleryCategory?: GalleryCategory;
  onUploaded?: () => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  plotId,
  imageType,
  galleryCategory,
  onUploaded,
}) => {
  const { user } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFile = async (file: File) => {
    setError('');
    setIsUploading(true);

    const path = `${plotId}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;

    const { error: uploadError } = await supabase.storage
      .from('plot-images')
      .upload(path, file, { contentType: file.type });

    if (uploadError) {
      setError(uploadError.message);
      setIsUploading(false);
      return;
    }

    const { error: dbError } = await supabase.from('plot_images').insert({
      plot_id: plotId,
      image_type: imageType,
      gallery_category: galleryCategory ?? null,
      storage_path: path,
      description: null,
      uploaded_by: user?.id ?? null,
      upload_date: new Date().toISOString().split('T')[0],
    });

    setIsUploading(false);
    if (dbError) {
      setError(dbError.message);
      return;
    }
    onUploaded?.();
  };

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={isUploading}
        className="flex items-center gap-2 px-4 py-2 bg-[#2d5a27] text-white text-sm font-medium rounded-lg hover:bg-[#234820] transition-colors disabled:opacity-60"
      >
        {isUploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
        {isUploading ? 'กำลังอัปโหลด...' : 'อัปโหลดรูป'}
      </button>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
};

export default ImageUpload;
