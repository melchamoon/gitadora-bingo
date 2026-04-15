import { useState, useCallback, useRef, useMemo } from 'react'
import BingoCell from './components/BingoCell'
import { Music, BingoSize, Difficulty, getImageUrl, MusicBase } from './types/bingo'
import { Plus, Trash2, Download, Loader2, Search } from 'lucide-react'
import { toPng } from 'html-to-image'
import { MOCK_MUSICS } from './data/musics'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  TouchSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

// D&D用の一意なIDを持つ型
interface SelectedMusic extends Music {
  instanceId: string;
}

type BingoCellData = SelectedMusic | null;

function App() {
  const [bingoSize, setBingoSize] = useState<BingoSize>(3)
  const totalCells = bingoSize * bingoSize
  const [selectedMusics, setSelectedMusics] = useState<BingoCellData[]>(Array(totalCells).fill(null))
  const [isDownloading, setIsDownloading] = useState(false)
  const bingoRef = useRef<HTMLDivElement>(null)

  // 空のセル用のIDを生成
  const getCellId = useCallback((index: number, cell: BingoCellData) => {
    return cell?.instanceId || `empty-${index}`;
  }, []);

  // 全セルのIDリスト（D&D用）
  const cellIds = useMemo(() => {
    return selectedMusics.map((cell, i) => getCellId(i, cell));
  }, [selectedMusics, getCellId]);

  // bingoSize変更時に配列サイズを調整
  const handleSizeChange = (newSize: BingoSize) => {
    const newTotalCells = newSize * newSize;
    setSelectedMusics(prev => {
      const next = [...prev];
      if (next.length < newTotalCells) {
        // サイズが大きくなった場合はnullで埋める
        return [...next, ...Array(newTotalCells - next.length).fill(null)];
      } else {
        // サイズが小さくなった場合は切り詰める
        return next.slice(0, newTotalCells);
      }
    });
    setBingoSize(newSize);
  };

  // D&D センサーの設定
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 検索・入力用ステート
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [selectedBaseMusic, setSelectedBaseMusic] = useState<MusicBase | null>(null)
  const [tempDifficulty, setTempDifficulty] = useState<Difficulty>('NONE')
  const [tempLevel, setTempLevel] = useState('1.00')

  const filteredMusics = useMemo(() => {
    if (selectedBaseMusic) return []

    if (!searchQuery) {
      return isSearchFocused ? MOCK_MUSICS.slice(0, 5) : []
    }

    const lowerQuery = searchQuery.toLowerCase()
    return MOCK_MUSICS.filter(m =>
      m.title.toLowerCase().includes(lowerQuery) ||
      m.artist.toLowerCase().includes(lowerQuery)
    ).slice(0, 5)
  }, [searchQuery, selectedBaseMusic, isSearchFocused])

  const handleDifficultyChange = (newDifficulty: Difficulty) => {
    setTempDifficulty(newDifficulty)

    if (newDifficulty === 'NONE') {
      setTempLevel('')
      return
    }

    const autoLevel = selectedBaseMusic?.levels?.[newDifficulty]
    if (autoLevel) {
      setTempLevel(autoLevel)
    }
  }

  const handleSelectBaseMusic = (music: MusicBase) => {
    setSelectedBaseMusic(music)
    setSearchQuery(music.title)
    setIsSearchFocused(false)

    if (tempDifficulty !== 'NONE') {
      const autoLevel = music.levels?.[tempDifficulty]
      if (autoLevel) {
        setTempLevel(autoLevel)
      }
    }
  }

  const handleAddMusic = () => {
    if (!selectedBaseMusic) return

    const emptyIndex = selectedMusics.findIndex(m => m === null);
    if (emptyIndex === -1) return;

    const newMusic: SelectedMusic = {
      ...selectedBaseMusic,
      difficulty: tempDifficulty,
      level: tempLevel,
      instanceId: `${selectedBaseMusic.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    }

    const nextMusics = [...selectedMusics];
    nextMusics[emptyIndex] = newMusic;
    setSelectedMusics(nextMusics);
    setSelectedBaseMusic(null)
    setSearchQuery('')
  }

  const handleRemoveMusic = (index: number) => {
    const nextMusics = [...selectedMusics];
    nextMusics[index] = null;
    setSelectedMusics(nextMusics);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSelectedMusics((items) => {
        const oldIndex = cellIds.indexOf(active.id as string);
        const newIndex = cellIds.indexOf(over.id as string);

        if (oldIndex !== -1 && newIndex !== -1) {
          return arrayMove(items, oldIndex, newIndex);
        }
        return items;
      });
    }
  };

  const handleDownload = useCallback(async () => {
    if (bingoRef.current === null) return

    setIsDownloading(true)

    // UIの更新（☓の非表示）を確実に行うために少し待機
    await new Promise(resolve => setTimeout(resolve, 100))

    try {
      const dataUrl = await toPng(bingoRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      })

      const link = document.createElement('a')
      link.download = 'gitadora-bingo.png'
      link.href = dataUrl
      link.click()
    } catch (err) {
      console.error('Failed to download image', err)
    } finally {
      setIsDownloading(false)
    }
  }, [bingoRef])

  return (
    <div className="min-h-screen bg-zinc-100 py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-black text-zinc-900 tracking-tight italic">GITADORA BINGO</h1>
          <p className="text-zinc-500 font-medium">お気に入りの曲でビンゴカードを作成しよう</p>
        </header>

        <main className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* 設定・操作パネル */}
          <div className="md:col-span-1 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-zinc-200">
            <section className="space-y-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <span className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-xs">1</span>
                <span>サイズ設定</span>
              </h2>
              <select
                value={bingoSize}
                onChange={(e) => handleSizeChange(Number(e.target.value) as BingoSize)}
                className="w-full p-2.5 rounded-xl border border-zinc-300 bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(size => (
                  <option key={size} value={size}>{size} x {size}</option>
                ))}
              </select>
            </section>

            <section className="space-y-4 pt-4 border-t border-zinc-100">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <span className="w-6 h-6 bg-zinc-900 text-white rounded-full flex items-center justify-center text-xs">2</span>
                <span>曲の選択</span>
              </h2>
              <div className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-zinc-400">
                    <Search size={16} />
                  </div>
                  <input
                    type="text"
                    placeholder="曲名・アーティスト検索"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                    className="w-full pl-10 p-2.5 text-sm rounded-xl border border-zinc-300 focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  />
                  {filteredMusics.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl overflow-hidden">
                      {filteredMusics.map(m => (
                        <button
                          key={m.id}
                          onClick={() => handleSelectBaseMusic(m)}
                          className="w-full p-3 text-left text-sm hover:bg-zinc-50 border-b last:border-0 border-zinc-100 transition-colors"
                        >
                          <div className="font-bold text-zinc-900">{m.title}</div>
                          <div className="text-[10px] text-zinc-500">{m.artist}</div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {selectedBaseMusic && (
                  <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex gap-3 items-center animate-in fade-in slide-in-from-top-1">
                    <img src={getImageUrl(selectedBaseMusic.id)} className="w-10 h-10 object-cover rounded shadow-sm" alt="" />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold truncate text-zinc-900">{selectedBaseMusic.title}</div>
                      <div className="text-[10px] text-zinc-500 truncate">{selectedBaseMusic.artist}</div>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedBaseMusic(null)
                        setSearchQuery('')
                      }}
                      className="text-zinc-400 hover:text-red-500 p-1 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <select
                    value={tempDifficulty}
                    onChange={(e) => handleDifficultyChange(e.target.value as Difficulty)}
                    className="flex-1 p-2.5 text-sm rounded-xl border border-zinc-300 bg-white focus:ring-2 focus:ring-zinc-900 outline-none transition-all"
                  >
                    <option value="NONE">なし</option>
                    <optgroup label="Drum">
                      <option value="BSC-D">BSC-D</option>
                      <option value="ADV-D">ADV-D</option>
                      <option value="EXT-D">EXT-D</option>
                      <option value="MAS-D">MAS-D</option>
                    </optgroup>
                    <optgroup label="Guitar">
                      <option value="BSC-G">BSC-G</option>
                      <option value="ADV-G">ADV-G</option>
                      <option value="EXT-G">EXT-G</option>
                      <option value="MAS-G">MAS-G</option>
                    </optgroup>
                    <optgroup label="Bass">
                      <option value="BSC-B">BSC-B</option>
                      <option value="ADV-B">ADV-B</option>
                      <option value="EXT-B">EXT-B</option>
                      <option value="MAS-B">MAS-B</option>
                    </optgroup>
                  </select>
                  <input
                    type="text"
                    placeholder="Lv"
                    value={tempLevel}
                    onChange={(e) => setTempLevel(e.target.value)}
                    className="w-20 p-2.5 text-sm rounded-xl border border-zinc-300 focus:ring-2 focus:ring-zinc-900 outline-none transition-all text-center font-mono"
                    disabled={tempDifficulty === 'NONE'}
                  />
                </div>
                <button
                  onClick={handleAddMusic}
                  disabled={!selectedBaseMusic || selectedMusics.every(m => m !== null)}
                  className="w-full py-3 bg-zinc-900 hover:bg-black disabled:bg-zinc-300 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-sm active:scale-[0.98]"
                >
                  <Plus size={18} />
                  ビンゴに追加
                </button>
                <button
                  onClick={() => setSelectedMusics(Array(totalCells).fill(null))}
                  disabled={selectedMusics.every(m => m === null)}
                  className="w-full py-3 bg-white hover:bg-zinc-50 disabled:opacity-50 text-zinc-600 border border-zinc-200 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                  <Trash2 size={18} />
                  すべて消す
                </button>
              </div>
            </section>
          </div>

          {/* ビンゴ表示エリア */}
          <div className="md:col-span-2 space-y-6">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <div
                ref={bingoRef}
                className="bg-white p-3 rounded-2xl shadow-xl border border-zinc-200"
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${bingoSize}, minmax(0, 1fr))`,
                  gap: '4px',
                  width: '100%',
                  maxWidth: '600px',
                  margin: '0 auto'
                }}
              >
                <SortableContext
                  items={cellIds}
                  strategy={rectSortingStrategy}
                >
                  {selectedMusics.map((music, i) => {
                    const id = cellIds[i];
                    return (
                      <BingoCell
                        key={id}
                        id={id}
                        music={music}
                        onRemove={music ? () => handleRemoveMusic(i) : undefined}
                        isExporting={isDownloading}
                      />
                    );
                  })}
                </SortableContext>
              </div>
            </DndContext>

            <div className="text-center text-sm text-zinc-500 font-medium">
              ドラッグ＆ドロップで曲を入れ替えできます
            </div>

            <div className="flex justify-center mt-8">
              <button
                onClick={handleDownload}
                disabled={isDownloading || selectedMusics.every(m => m === null)}
                className="px-10 py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-300 text-white rounded-full font-bold flex items-center gap-3 shadow-lg transition-all active:scale-95 hover:shadow-blue-200 hover:shadow-2xl"
              >
                {isDownloading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <Download size={20} />
                )}
                {isDownloading ? '生成中...' : '画像をダウンロード'}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default App
