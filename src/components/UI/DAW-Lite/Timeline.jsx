import React, { useState } from "react";
import Waveform from "./Waveform";

export default function Timeline({ placedLoops, currentBeat, isPlaying, bpm, onDrop, onDragOver, removeLoop, onLoopDrag, onLoopTrim }) {
  const rows = 5; // Tracks
  const bars = 10;
  const beatsPerBar = 4;
  const subdivisionsPerBeat = 4; // 16th notes
  const totalCols = bars * beatsPerBar * subdivisionsPerBeat; // 160 grid units
  const [draggedLoopId, setDraggedLoopId] = useState(null);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  const [trimmingLoopId, setTrimmingLoopId] = useState(null);
  const [trimSide, setTrimSide] = useState(null); // 'left' or 'right'

  // Convert beat index to grid column
  const beatToGridCol = (beat) => beat * subdivisionsPerBeat;
  const gridColToBeat = (col) => Math.floor(col / subdivisionsPerBeat);

  // Snap to grid (16th notes)
  const snapToGrid = (col) => {
    return Math.floor(col / subdivisionsPerBeat) * subdivisionsPerBeat;
  };

  // Check if position overlaps with existing loop on same track
  const hasOverlap = (row, col, span, excludeId = null) => {
    return placedLoops.some(loop => {
      if (loop.id === excludeId) return false;
      if (loop.row !== row) return false;
      // Check if loops overlap
      const loopEnd = loop.col + loop.span;
      const newEnd = col + span;
      return (col < loopEnd && newEnd > loop.col);
    });
  };

  const handlePlacedLoopDragStart = (e, loop) => {
    // Don't start dragging if clicking on trim handle
    if (e.target.classList.contains('trim-handle')) {
      return;
    }
    e.stopPropagation();
    setDraggedLoopId(loop.id);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragStartPos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handlePlacedLoopDragEnd = (e) => {
    if (!draggedLoopId) return;

    const timeline = e.currentTarget.closest('.timeline-container');
    if (!timeline) {
      setDraggedLoopId(null);
      return;
    }

    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const cellWidth = rect.width / totalCols;
    const cellHeight = 100;
    let newCol = Math.max(0, Math.min(totalCols - 1, Math.floor(x / cellWidth)));
    let newRow = Math.max(0, Math.min(rows - 1, Math.floor(y / cellHeight)));

    // Snap to grid
    newCol = snapToGrid(newCol);

    // Get the loop being dragged
    const draggedLoop = placedLoops.find(l => l.id === draggedLoopId);
    if (draggedLoop && !hasOverlap(newRow, newCol, draggedLoop.span, draggedLoopId)) {
      onLoopDrag(draggedLoopId, newRow, newCol);
    }

    setDraggedLoopId(null);
  };

  const handleCellDrop = (e, row, col) => {
    e.preventDefault();
    const snappedCol = snapToGrid(col);
    onDrop(row, snappedCol);
  };

  const handleTrimStart = (e, loop, side) => {
    e.stopPropagation();
    setTrimmingLoopId(loop.id);
    setTrimSide(side);
  };

  const handleTrimMove = (e) => {
    if (!trimmingLoopId || !trimSide) return;

    const timeline = e.currentTarget.closest('.timeline-container');
    if (!timeline) return;

    const rect = timeline.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const cellWidth = rect.width / totalCols;
    let newCol = Math.max(0, Math.min(totalCols - 1, Math.floor(x / cellWidth)));
    newCol = snapToGrid(newCol);

    const loop = placedLoops.find(l => l.id === trimmingLoopId);
    if (!loop) return;

    if (trimSide === 'left') {
      // Trim from left: adjust start position and reduce span
      const maxCol = loop.col + loop.span - subdivisionsPerBeat; // Minimum 1 beat
      const trimmedCol = Math.min(newCol, maxCol);
      const newSpan = loop.span - (trimmedCol - loop.col);

      if (newSpan >= subdivisionsPerBeat && trimmedCol >= 0) {
        onLoopTrim(loop.id, { col: trimmedCol, span: newSpan });
      }
    } else if (trimSide === 'right') {
      // Trim from right: reduce span only
      const minCol = loop.col + subdivisionsPerBeat; // Minimum 1 beat
      const trimmedEnd = Math.max(newCol, minCol);
      const newSpan = trimmedEnd - loop.col;

      if (newSpan >= subdivisionsPerBeat) {
        onLoopTrim(loop.id, { span: newSpan });
      }
    }
  };

  const handleTrimEnd = () => {
    setTrimmingLoopId(null);
    setTrimSide(null);
  };

  return (
    <div className="flex-1 p-6 overflow-x-auto">
      <div
        className="timeline-container relative border-2 border-black bg-white"
        style={{ minWidth: '800px' }}
        onMouseMove={handleTrimMove}
        onMouseUp={handleTrimEnd}
        onMouseLeave={handleTrimEnd}
      >
        {/* Track Labels */}
        <div className="absolute left-0 top-0 bottom-0 w-16 border-r-2 border-gray-600 bg-gray-100 z-10">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="h-[100px] border-b border-gray-400 flex items-center justify-center text-xs font-semibold text-gray-600">
              Track {i + 1}
            </div>
          ))}
        </div>

        {/* Main Timeline Grid */}
        <div className="ml-16 relative" style={{ width: 'calc(100% - 4rem)' }}>
          <div className="grid gap-0 relative" style={{
            gridTemplateColumns: `repeat(${totalCols}, 1fr)`,
            gridTemplateRows: `repeat(${rows}, 100px)`
          }}>
            {Array.from({ length: rows * totalCols }).map((_, i) => {
              const row = Math.floor(i / totalCols);
              const col = i % totalCols;
              const isBarStart = col % (beatsPerBar * subdivisionsPerBeat) === 0;
              const isBeatStart = col % subdivisionsPerBeat === 0;
              const gridBeat = gridColToBeat(col);
              const isCurrentBeat = isPlaying && gridBeat === currentBeat;

              return (
                <div
                  key={i}
                  onDrop={(e) => handleCellDrop(e, row, col)}
                  onDragOver={onDragOver}
                  className={`h-[100px] transition-colors ${isBarStart
                    ? 'border-l-2 border-gray-700 bg-gray-50'
                    : isBeatStart
                      ? 'border-l border-gray-500 bg-[#e9f4f8]'
                      : 'border-l border-gray-300 bg-[#e9f4f8]'
                    } ${row === 0 ? 'border-t-2 border-gray-600' : 'border-t border-gray-400'
                    } ${row === rows - 1 ? 'border-b-2 border-gray-600' : ''
                    } ${isCurrentBeat ? 'bg-blue-200' : ''
                    } hover:bg-gray-50`}
                />
              );
            })}

            {/* Placed Loops */}
            {placedLoops.map((loop) => {
              const loopStartBeat = gridColToBeat(loop.col);
              const loopEndBeat = gridColToBeat(loop.col + loop.span);
              const isLoopPlaying = isPlaying && currentBeat >= loopStartBeat && currentBeat < loopEndBeat;

              // Calculate actual width for waveform (approximate)
              const timelineWidth = typeof window !== 'undefined' ? window.innerWidth * 0.6 : 800;
              const loopWidth = Math.max(200, (loop.span / totalCols) * timelineWidth);

              return (
                <div
                  key={loop.id}
                  draggable
                  onDragStart={(e) => handlePlacedLoopDragStart(e, loop)}
                  onDragEnd={handlePlacedLoopDragEnd}
                  style={{
                    position: 'absolute',
                    top: `${loop.row * 100}px`,
                    left: `${(loop.col / totalCols) * 100}%`,
                    width: `${(loop.span / totalCols) * 100}%`,
                    height: '100px',
                    minWidth: '40px',
                  }}
                  className={`${loop.color} border-2 ${loop.border} rounded-md flex items-center justify-between px-3 font-semibold text-sm shadow-lg group hover:shadow-xl transition-all cursor-move active:cursor-grabbing relative overflow-hidden opacity-80 hover:opacity-90 ${isLoopPlaying ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
                    }`}
                >
                  {/* Waveform Background */}
                  {loop.url && (
                    <Waveform
                      audioUrl={loop.url}
                      width={loopWidth}
                      height={100}
                    />
                  )}

                  {/* Content Overlay */}
                  <div className="relative z-10 flex items-center justify-between w-full px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg drop-shadow-md">{loop.icon}</span>
                      <span className="text-black drop-shadow-md font-semibold">{loop.type}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeLoop(loop.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs hover:bg-red-600 transition-all z-20 shadow-lg"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Trim Handles */}
                  {/* Left Trim Handle */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleTrimStart(e, loop, 'left');
                    }}
                    className="trim-handle absolute left-0 top-0 bottom-0 w-3 bg-blue-500 opacity-0 group-hover:opacity-100 cursor-ew-resize hover:bg-blue-600 transition-all z-30 border-r border-blue-700"
                    style={{ cursor: 'ew-resize' }}
                    title="Drag to trim from start"
                  />

                  {/* Right Trim Handle */}
                  <div
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleTrimStart(e, loop, 'right');
                    }}
                    className="trim-handle absolute right-0 top-0 bottom-0 w-3 bg-blue-500 opacity-0 group-hover:opacity-100 cursor-ew-resize hover:bg-blue-600 transition-all z-30 border-l border-blue-700"
                    style={{ cursor: 'ew-resize' }}
                    title="Drag to trim from end"
                  />
                </div>
              );
            })}

            {/* Playhead */}
            {isPlaying && (
              <div
                className="absolute top-0 bottom-0 w-1 bg-red-500 pointer-events-none z-50 shadow-lg"
                style={{
                  left: `${(beatToGridCol(currentBeat) / totalCols) * 100}%`,
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bar Numbers */}
      <div className="ml-16 mt-2 flex">
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className="text-center text-xs font-semibold text-gray-600 border-l-2 border-gray-700"
            style={{ width: `${(beatsPerBar * subdivisionsPerBeat / totalCols) * 100}%` }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}