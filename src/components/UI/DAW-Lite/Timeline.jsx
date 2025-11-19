import React from "react";

export default function Timeline({ placedLoops, currentBeat, isPlaying, onDrop, onDragOver, removeLoop }) {
  const rows = 5;
  const cols = 10;

  return (
    <div className="flex-1 p-6">
      <div className="grid grid-cols-10 grid-rows-5 gap-0 border-2 border-black relative">
        {/* Grid Cells */}
        {Array.from({ length: rows * cols }).map((_, i) => {
          const row = Math.floor(i / cols);
          const col = i % cols;
          const isCurrentBeat = isPlaying && col === currentBeat;
          
          return (
            <div
              key={i}
              onDrop={() => onDrop(row, col)}
              onDragOver={onDragOver}
              className={`border border-gray-400 h-[100px] transition-colors ${
                isCurrentBeat ? 'bg-blue-100' : 'bg-[#e9f4f8] hover:bg-gray-50'
              }`}
            />
          );
        })}

        {/* Placed Loops */}
        {placedLoops.map((loop) => (
          <div
            key={loop.id}
            style={{
              position: 'absolute',
              top: `${loop.row * 100}px`,
              left: `${(loop.col / cols) * 100}%`,
              width: `${(loop.span / cols) * 100}%`,
              height: '100px',
            }}
            className={`${loop.color} border-2 ${loop.border} rounded-md flex items-center justify-between px-3 font-semibold text-sm shadow-lg group hover:shadow-xl transition-all`}
          >
            <div className="flex items-center gap-2">
              <span className="text-lg">{loop.icon}</span>
              <span className="text-black">{loop.type}</span>
            </div>
            <button
              onClick={() => removeLoop(loop.id)}
              className="opacity-0 group-hover:opacity-100 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all"
            >
              ✕
            </button>
          </div>
        ))}

        {/* Playhead */}
        {isPlaying && (
          <div
            className="absolute top-0 bottom-0 w-1 bg-red-500 pointer-events-none z-50"
            style={{
              left: `${(currentBeat / cols) * 100}%`,
            }}
          />
        )}
      </div>

      {/* Bar Numbers */}
      <div className="mt-2 grid grid-cols-10 gap-0">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="text-center text-xs font-semibold text-gray-500">
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}