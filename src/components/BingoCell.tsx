import React from 'react';
import { Music, getDifficultyColor, getImageUrl, DEFAULT_IMAGE_URL } from '../types/bingo';
import { X, GripVertical } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BingoCellProps {
  id: string;
  music: Music | null;
  onRemove?: () => void;
  isExporting?: boolean;
}

const BingoCell: React.FC<BingoCellProps> = ({ id, music, onRemove, isExporting }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
    touchAction: 'none',
  };

  if (!music) {
    return (
      <div className="aspect-square bg-zinc-200 border border-zinc-300 flex items-center justify-center overflow-hidden">
        <img
          src={DEFAULT_IMAGE_URL}
          alt="Empty"
          className="w-full h-full object-cover opacity-50"
        />
      </div>
    );
  }

  const color = getDifficultyColor(music.difficulty);
  const imageUrl = music.imageUrl || getImageUrl(music.id);

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square bg-zinc-800 border border-zinc-400 overflow-hidden group ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      {...attributes}
      {...listeners}
    >
      <img
        src={imageUrl}
        alt={music.title}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
        draggable={false}
      />

      {/* ドラッグハンドル表示 (PCはホバー、モバイルは常時) */}
      {!isExporting && (
        <div className="absolute inset-0 bg-black/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <GripVertical className="text-white opacity-30 md:opacity-50" size={24} />
        </div>
      )}

      {/* 削除ボタン */}
      {onRemove && !isExporting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute top-1 right-1 w-6 h-6 bg-black/40 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors z-10 backdrop-blur-sm border border-white/20"
          aria-label="削除"
        >
          <X size={14} strokeWidth={3} />
        </button>
      )}

      {/* 難易度とレベルのラベル */}
      {music.difficulty !== 'NONE' && (
        <div
          className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[10px] md:text-xs font-bold text-white shadow-md border border-white/20"
          style={{
            backgroundColor: color,
            textShadow: '1px 1px 0px rgba(0,0,0,0.8), -1px -1px 0px rgba(0,0,0,0.8), 1px -1px 0px rgba(0,0,0,0.8), -1px 1px 0px rgba(0,0,0,0.8)'
          }}
        >
          <span className="mr-1">{music.difficulty}</span>
          <span>{music.level}</span>
        </div>
      )}
    </div>
  );
};

export default BingoCell;
