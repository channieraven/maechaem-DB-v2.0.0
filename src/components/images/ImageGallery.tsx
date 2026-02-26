import React, { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';
import type { PlotImage, ImageType } from '../../lib/database.types';
import { useAuth } from '../../contexts/AuthContext';
import ImageCard from './ImageCard';
import ImageUpload from './ImageUpload';
import { Loader2 } from 'lucide-react';

interface ImageGalleryProps {
  plotId: string;
}

const IMAGE_TYPE_LABELS: Record<ImageType, string> = {
  plan_pre_1: 'แผนผังก่อนปลูก (แผ่น 1)',
  plan_pre_2: 'แผนผังก่อนปลูก (แผ่น 2)',
  plan_post_1: 'แผนผังหลังปลูก',
  gallery: 'คลังภาพ',
};

const IMAGE_TYPES: ImageType[] = ['plan_pre_1', 'plan_pre_2', 'plan_post_1', 'gallery'];

const ImageGallery: React.FC<ImageGalleryProps> = ({ plotId }) => {
  const { canWrite } = useAuth();
  const [images, setImages] = useState<PlotImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeType, setActiveType] = useState<ImageType>('gallery');

  const fetchImages = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('plot_images')
      .select('*')
      .eq('plot_id', plotId)
      .order('created_at', { ascending: false });
    setImages((data ?? []) as PlotImage[]);
    setIsLoading(false);
  };

  useEffect(() => { fetchImages(); }, [plotId]);

  const filtered = images.filter((img) => img.image_type === activeType);

  return (
    <div>
      {/* Tab strip */}
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {IMAGE_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setActiveType(type)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              activeType === type
                ? 'bg-[#2d5a27] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {IMAGE_TYPE_LABELS[type]}
            {images.filter((i) => i.image_type === type).length > 0 && (
              <span className="ml-1.5 opacity-70">
                ({images.filter((i) => i.image_type === type).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Upload button */}
      {canWrite && (
        <div className="mb-4">
          <ImageUpload
            plotId={plotId}
            imageType={activeType}
            galleryCategory={activeType === 'gallery' ? 'tree' : undefined}
            onUploaded={fetchImages}
          />
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-[#2d5a27]" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-gray-400 text-sm bg-gray-50 rounded-xl">
          ยังไม่มีรูปภาพในหมวดหมู่นี้
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {filtered.map((img) => (
            <ImageCard key={img.id} image={img} onDeleted={fetchImages} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
