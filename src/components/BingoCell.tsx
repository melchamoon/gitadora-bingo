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

  const color = music ? getDifficultyColor(music.difficulty) : 'transparent';
  const imageUrl = music ? (music.imageUrl || getImageUrl(music.id)) : DEFAULT_IMAGE_URL;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative aspect-square border overflow-hidden group [container-type:inline-size] ${
        music ? 'bg-zinc-800 border-zinc-400' : 'bg-zinc-200 border-zinc-300'
      } ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
      {...attributes}
      {...listeners}
    >
      <img
        src={imageUrl}
        alt={music?.title || "Empty"}
        className={`w-full h-full object-cover transition-transform ${
          music ? 'group-hover:scale-105' : 'opacity-50'
        }`}
        loading="lazy"
        draggable={false}
      />

      {/* ドラッグハンドル表示 (PCはホバー、モバイルは常時) */}
      {!isExporting && (
        <div className="absolute inset-0 bg-black/10 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <GripVertical 
            className="text-white opacity-30 md:opacity-50" 
            style={{ width: '15cqw', height: '15cqw' }}
          />
        </div>
      )}

      {/* 削除ボタン */}
      {music && onRemove && !isExporting && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="absolute bg-black/40 hover:bg-red-500 text-white rounded-full flex items-center justify-center transition-colors z-10 backdrop-blur-sm border border-white/20"
          style={{
            top: '4cqw',
            right: '4cqw',
            width: '12cqw',
            height: '12cqw',
            maxWidth: '24px',
            maxHeight: '24px',
            minWidth: '16px',
            minHeight: '16px',
          }}
          aria-label="削除"
        >
          <X style={{ width: '60%', height: '60%' }} strokeWidth={3} />
        </button>
      )}

      {/* 難易度とレベルのラベル */}
      {music && music.difficulty !== 'NONE' && (
        <div
          className="absolute font-bold text-white shadow-md border border-white/20 flex items-center justify-center whitespace-nowrap"
          style={{
            backgroundColor: color,
            textShadow: '1px 1px 0px rgba(0,0,0,0.8), -1px -1px 0px rgba(0,0,0,0.8), 1px -1px 0px rgba(0,0,0,0.8), -1px 1px 0px rgba(0,0,0,0.8)',
            bottom: '4cqw',
            right: '4cqw',
            fontSize: 'min(max(8px, 7cqw), 14px)',
            padding: '1cqw 2cqw',
            borderRadius: '1cqw',
          }}
        >
          <span className="mr-[1cqw]">{music.difficulty}</span>
          <span>{music.level}</span>
        </div>
      )}
    </div>
  );
};

export default BingoCell;
