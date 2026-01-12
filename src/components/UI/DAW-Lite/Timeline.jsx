import React, { useState, useEffect } from "react";
import Waveform from "./Waveform";

export default function Timeline({ placedLoops, currentBeat, isPlaying, bpm, onDrop, onDragOver, removeLoop, onLoopDrag, onLoopTrim, bars: propBars, rows: propRows, onExtendTimeline }) {
  const beatsPerBar = 4;
  const subdivisionsPerBeat = 4; // 16th notes
  const DEFAULT_BARS = 10;
  const DEFAULT_ROWS = 5;
  const [zoom, setZoom] = useState(1); // Zoom level (1 = 100%)
  
  // Calculate required bars and rows based on placed loops
  const calculateRequiredDimensions = () => {
    if (placedLoops.length === 0) {
      // No loops - return to default
      return { bars: DEFAULT_BARS, rows: DEFAULT_ROWS };
    }
    
    let maxCol = 0;
    let maxRow = 0;
    
    placedLoops.forEach(loop => {
      const loopEndCol = loop.col + loop.span;
      if (loopEndCol > maxCol) maxCol = loopEndCol;
      if (loop.row >= maxRow) maxRow = loop.row + 1;
    });
    
    // Convert columns to bars (round up), but don't go below default
    const requiredBars = Math.max(DEFAULT_BARS, Math.ceil(maxCol / (beatsPerBar * subdivisionsPerBeat)));
    const requiredRows = Math.max(DEFAULT_ROWS, maxRow || DEFAULT_ROWS);
    
    return { bars: requiredBars, rows: requiredRows };
  };
  
  const { bars, rows } = calculateRequiredDimensions();
  const totalCols = bars * beatsPerBar * subdivisionsPerBeat;
  
  // Calculate cell dimensions based on zoom
  const baseCellHeight = 100;
  const cellHeight = baseCellHeight * zoom;
  
  // Notify parent if timeline dimensions changed (extend or shrink)
  useEffect(() => {
    if (onExtendTimeline) {
      const currentBars = propBars || DEFAULT_BARS;
      const currentRows = propRows || DEFAULT_ROWS;
      
      // Update if dimensions changed (either extended or shrunk)
      if (bars !== currentBars || rows !== currentRows) {
        onExtendTimeline(bars, rows);
      }
    }
  }, [bars, rows, propBars, propRows, onExtendTimeline]);
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
    const currentCellHeight = baseCellHeight * zoom;
    let newCol = Math.max(0, Math.min(totalCols - 1, Math.floor(x / cellWidth)));
    let newRow = Math.max(0, Math.min(rows - 1, Math.floor(y / currentCellHeight)));

    // Snap to grid
    newCol = snapToGrid(newCol);

    // Get the loop being dragged
    const draggedLoop = placedLoops.find(l => l.id === draggedLoopId);
    if (draggedLoop && !hasOverlap(newRow, newCol, draggedLoop.span, draggedLoopId)) {
      onLoopDrag(draggedLoopId, newRow, newCol);
    }

    setDraggedLoopId(null);
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
    const currentCellHeight = baseCellHeight * zoom;
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

  // Zoom controls
  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.25, 3)); // Max 300%
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.25, 0.5)); // Min 50%
  };

  const handleZoomReset = () => {
    setZoom(1);
  };

  return (
    <div className="flex-1 p-6 overflow-x-auto overflow-y-auto">
      {/* Zoom Controls */}
      <div className="mb-4 flex items-center justify-end gap-2 sticky top-0 bg-[#eaf5f9] z-50 pb-2">
        <span className="text-xs font-semibold text-gray-600">Zoom:</span>
        <button
          onClick={handleZoomOut}
          className="w-8 h-8 border-2 border-gray-300 rounded bg-white hover:bg-gray-100 flex items-center justify-center text-sm font-bold transition-colors"
          title="Zoom Out"
        >
          −
        </button>
        <span className="text-xs font-semibold text-gray-700 w-12 text-center">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={handleZoomIn}
          className="w-8 h-8 border-2 border-gray-300 rounded bg-white hover:bg-gray-100 flex items-center justify-center text-sm font-bold transition-colors"
          title="Zoom In"
        >
          +
        </button>
        <button
          onClick={handleZoomReset}
          className="px-3 h-8 border-2 border-gray-300 rounded bg-white hover:bg-gray-100 text-xs font-semibold text-gray-700 transition-colors"
          title="Reset Zoom"
        >
          Reset
        </button>
      </div>

      <div
        className="timeline-container relative border-2 border-black bg-white"
        style={{ 
          minWidth: `${800 * zoom}px`,
        }}
        onMouseMove={handleTrimMove}
        onMouseUp={handleTrimEnd}
        onMouseLeave={handleTrimEnd}
      >
        {/* Track Labels */}
        <div className="absolute left-0 top-0 bottom-0 border-r-2 border-gray-600 bg-gray-100 z-10" style={{ width: `${64 * zoom}px` }}>
          {Array.from({ length: rows }).map((_, i) => (
            <div 
              key={i} 
              className="border-b border-gray-400 flex items-center justify-center text-xs font-semibold text-gray-600"
              style={{ height: `${cellHeight}px` }}
            >
              Track {i + 1}
            </div>
          ))}
        </div>

        {/* Main Timeline Grid */}
        <div className="relative" style={{ width: 'calc(100% - 4rem)', marginLeft: `${64 * zoom}px` }}>
          <div 
            className="grid gap-0 relative"
            style={{
              gridTemplateColumns: `repeat(${totalCols}, ${800 * zoom / totalCols}px)`,
              gridTemplateRows: `repeat(${rows}, ${cellHeight}px)`
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              
              // Use actual mouse position relative to timeline container for accurate positioning
              const timeline = e.currentTarget.closest('.timeline-container');
              if (!timeline) return;
              
              const rect = timeline.getBoundingClientRect();
              const x = e.clientX - rect.left;
              const y = e.clientY - rect.top;
              
              // Account for the left margin (track labels)
              const gridAreaLeft = 64; // 4rem = 64px
              const gridX = x - gridAreaLeft;
              const gridAreaWidth = rect.width - gridAreaLeft;
              
              // Calculate column and row from actual mouse position
              const cellWidth = gridAreaWidth / totalCols;
              const cellHeight = 100;
              
              let calculatedCol = Math.max(0, Math.min(totalCols - 1, Math.floor(gridX / cellWidth)));
              let calculatedRow = Math.max(0, Math.min(rows - 1, Math.floor(y / cellHeight)));
              
              // Snap to grid
              const snappedCol = snapToGrid(calculatedCol);
              
              onDrop(calculatedRow, snappedCol);
            }}
            onDragOver={onDragOver}
          >
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
                  className={`transition-colors ${isBarStart
                    ? 'border-l-2 border-gray-700 bg-gray-50'
                    : isBeatStart
                      ? 'border-l border-gray-500 bg-[#e9f4f8]'
                      : 'border-l border-gray-300 bg-[#e9f4f8]'
                    } ${row === 0 ? 'border-t-2 border-gray-600' : 'border-t border-gray-400'
                    } ${row === rows - 1 ? 'border-b-2 border-gray-600' : ''
                    } ${isCurrentBeat ? 'bg-blue-200' : ''
                    } hover:bg-gray-50`}
                  style={{ height: `${cellHeight}px` }}
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
                    top: `${loop.row * cellHeight}px`,
                    left: `${(loop.col / totalCols) * 100}%`,
                    width: `${(loop.span / totalCols) * 100}%`,
                    height: `${cellHeight}px`,
                    minWidth: `${40 * zoom}px`,
                  }}
                  className={`${loop.color} border-2 ${loop.border} rounded-md flex items-center justify-between px-3 font-semibold text-sm shadow-lg group hover:shadow-xl transition-all cursor-move active:cursor-grabbing relative overflow-hidden opacity-80 hover:opacity-90 ${isLoopPlaying ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''
                    }`}
                >
                  {/* Waveform Background */}
                  {loop.url && (
                    <Waveform
                      audioUrl={loop.url}
                      width={loopWidth}
                      height={cellHeight}
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
      <div className="mt-2 flex" style={{ marginLeft: `${64 * zoom}px` }}>
        {Array.from({ length: bars }).map((_, i) => (
          <div
            key={i}
            className="text-center font-semibold text-gray-600 border-l-2 border-gray-700"
            style={{ 
              width: `${(beatsPerBar * subdivisionsPerBeat / totalCols) * 800 * zoom}px`,
              fontSize: `${12 * zoom}px`
            }}
          >
            {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
}