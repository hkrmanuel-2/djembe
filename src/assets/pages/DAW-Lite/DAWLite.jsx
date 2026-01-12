import { useState, useEffect } from "react";
import { useStore } from "../../../store/useStore.js";
import LoopLibrary from "../../../components/ui/DAW-Lite/LoopLibrary.jsx";
import Timeline from "../../../components/ui/DAW-Lite/Timeline.jsx";
import TransportControls from "../../../components/ui/DAW-Lite/Transportcontrols.jsx";
import ProjectMenu from "../../../components/ui/DAW-Lite/Projectmenu.jsx";
import AILoopGenerator from "../../../components/ui/DAW-Lite/AILoopGenerator.jsx";

export default function DAWLite() {
  const [draggedLoop, setDraggedLoop] = useState(null);

  // Get state from Zustand store
  const placedLoops = useStore((state) => state.project.placedLoops);
  const isPlaying = useStore((state) => state.transport.isPlaying);
  const bpm = useStore((state) => state.transport.bpm);
  const currentBeat = useStore((state) => state.transport.currentBeat);
  const projectName = useStore((state) => state.project.name);
  const projectBars = useStore((state) => state.project.bars);
  const error = useStore((state) => state.error);
  const audioInitialized = useStore((state) => state.audioInitialized);

  // Get actions from store
  const loadLoops = useStore((state) => state.loadLoops);
  const addPlacedLoop = useStore((state) => state.addPlacedLoop);
  const removePlacedLoop = useStore((state) => state.removePlacedLoop);
  const updatePlacedLoop = useStore((state) => state.updatePlacedLoop);
  const setProjectName = useStore((state) => state.setProjectName);
  const updateProjectDimensions = useStore((state) => state.updateProjectDimensions);

  // Calculate loop span based on audio duration and BPM (target: 4 bars = 16 beats)
  const calculateSpan = async (audioUrl, targetBars = 4) => {
    return new Promise((resolve) => {
      const audio = new Audio(audioUrl);
      audio.addEventListener('loadedmetadata', () => {
        const duration = audio.duration; // seconds
        const secondsPerBeat = 60 / bpm;
        const beats = duration / secondsPerBeat;
        // Round to nearest beat, minimum target bars
        const targetBeats = targetBars * 4; // 4 beats per bar
        const calculatedBeats = Math.max(targetBeats, Math.round(beats));
        // Convert to grid units (4 subdivisions per beat = 16th notes)
        const gridUnits = calculatedBeats * 4;
        resolve(Math.max(16, Math.round(gridUnits))); // Minimum 4 bars (16 beats * 4 = 64 grid units, but let's use 16 for 4 bars)
      });
      audio.addEventListener('error', () => {
        resolve(64); // Fallback: 4 bars * 4 beats * 4 subdivisions = 64 grid units
      });
      audio.load();
    });
  };

  // Load loops from database on mount
  useEffect(() => {
    loadLoops();
  }, [loadLoops]);

  const handleDragStart = (loop) => {
    setDraggedLoop(loop);
  };

  const handleDrop = async (row, col) => {
    if (draggedLoop) {
      // Calculate span based on audio duration
      const span = draggedLoop.url 
        ? await calculateSpan(draggedLoop.url, 4)
        : 64; // Default: 4 bars (64 grid units)
      
      // Check if loop extends beyond current timeline
      const subdivisionsPerBeat = 4;
      const beatsPerBar = 4;
      const loopEndCol = col + span;
      const currentTotalCols = (projectBars || 10) * beatsPerBar * subdivisionsPerBeat;
      const requiredBars = Math.ceil(loopEndCol / (beatsPerBar * subdivisionsPerBeat));
      
      // Extend timeline if needed
      if (requiredBars > (projectBars || 10)) {
        updateProjectDimensions(requiredBars, 5); // Keep rows at 5 for now, Timeline will calculate if more needed
      }
      
      const newLoop = {
        id: Date.now(),
        loopId: draggedLoop.id,
        type: draggedLoop.name,
        color: draggedLoop.color,
        border: draggedLoop.border,
        icon: draggedLoop.icon,
        url: draggedLoop.url,  
        row,
        col,
        span,
      };
  
      // Check for overlaps - remove overlapping loops on same track
      const overlappingLoops = placedLoops.filter(loop => 
        loop.row === row && 
        (col < loop.col + loop.span && col + span > loop.col)
      );
      
      // Remove overlapping loops
      overlappingLoops.forEach(loop => removePlacedLoop(loop.id));
      
      addPlacedLoop(newLoop);

      // Preview sound
      if (newLoop.url) {
        const audio = new Audio(newLoop.url);
        audio.volume = 0.5;
        audio.play().catch((err) => console.log("Audio play error:", err));
      }
  
      setDraggedLoop(null);
    }
  };

  const handlePlacedLoopDrag = (loopId, newRow, newCol) => {
    updatePlacedLoop(loopId, { row: newRow, col: newCol });
  };

  const handleLoopTrim = (loopId, updates) => {
    updatePlacedLoop(loopId, updates);
  };
  

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleExtendTimeline = (bars, rows) => {
    updateProjectDimensions(bars, rows);
  };

  const handleLoopGenerated = (newLoop) => {
    // Loop is already added to library and will appear automatically
    // Could show a notification here if needed
    console.log('New AI loop generated:', newLoop);
  };

  return (
    <div className="min-h-screen bg-[#cfeefa] flex items-center justify-center p-6">
      <div className="w-full max-w-[1800px] bg-[#eaf5f9] rounded-xl border border-black shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-[#003c82] tracking-wide">DAW-LITE</h1>

            {/* Audio Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${audioInitialized ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <span className="text-xs text-gray-600">
                {audioInitialized ? 'Audio Ready' : 'Click Play to start'}
              </span>
            </div>
          </div>

          {/* Editable Project Name */}
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-[350px] h-[40px] bg-white border-2 border-gray-300 rounded-full px-6 text-center font-semibold text-gray-700 focus:outline-none focus:border-[#003c82]"
            placeholder="Project Name"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mx-4 mt-4">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Project Menu (Save/Load) */}
        <ProjectMenu />

        {/* MAIN AREA */}
        <div className="flex">
          <div className="flex">
            <AILoopGenerator onLoopGenerated={handleLoopGenerated} />
            <LoopLibrary onDragStart={handleDragStart} />
          </div>

          <Timeline
            placedLoops={placedLoops}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            bpm={bpm}
            bars={projectBars}
            rows={5}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            removeLoop={removePlacedLoop}
            onLoopDrag={handlePlacedLoopDrag}
            onLoopTrim={handleLoopTrim}
            onExtendTimeline={handleExtendTimeline}
          />
        </div>

        {/* Transport Controls */}
        <TransportControls />
        
        
      </div>
    </div>
  );
}