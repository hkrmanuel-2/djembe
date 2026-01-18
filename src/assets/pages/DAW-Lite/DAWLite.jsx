import { useState, useEffect } from "react";
import { useStore } from "../../../store/useStore.js";
import LoopLibrary from "../../../components/ui/DAW-Lite/LoopLibrary.jsx";
import Timeline from "../../../components/ui/DAW-Lite/Timeline.jsx";
import TransportControls from "../../../components/ui/DAW-Lite/Transportcontrols.jsx";
import ProjectMenu from "../../../components/ui/DAW-Lite/Projectmenu.jsx";
import AILoopGenerator from "../../../components/ui/DAW-Lite/AILoopGenerator.jsx";
import CloudShader from "../../../components/ui/cloud-shader";

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
    <div className="h-screen bg-black relative overflow-hidden flex items-center justify-center p-4">
      {/* CloudShader Background */}
      <div className="absolute inset-0 z-0">
        <CloudShader
          speed={0.3}
          octaves={5}
          scale={2.5}
          className="w-full h-full opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/60" />
      </div>

      {/* Fun Musical Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-12 text-3xl opacity-15 animate-bounce" style={{animationDuration: '4s'}}>🎵</div>
        <div className="absolute top-1/4 right-24 text-2xl opacity-10 animate-bounce" style={{animationDuration: '5s', animationDelay: '1s'}}>🎶</div>
        <div className="absolute bottom-32 left-1/4 text-4xl opacity-12 animate-bounce" style={{animationDuration: '3.5s', animationDelay: '2s'}}>⭐</div>
        <div className="absolute top-2/3 right-16 text-3xl opacity-15 animate-bounce" style={{animationDuration: '4.5s', animationDelay: '0.5s'}}>✨</div>
      </div>

      <div className="relative z-10 w-full h-full max-w-[1800px] bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col">

        {/* HEADER */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-white/5 flex-shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">DAW-LITE</h1>

            {/* Audio Status Indicator */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${audioInitialized ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.6)]'}`} />
              <span className="text-xs text-white/60">
                {audioInitialized ? 'Audio Ready' : 'Click Play to start'}
              </span>
            </div>
          </div>

          {/* Editable Project Name */}
          <input
            type="text"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
            className="w-[250px] h-[32px] bg-white/10 border-2 border-white/20 rounded-full px-4 text-center font-semibold text-sm text-white placeholder:text-white/40 focus:outline-none focus:border-white/40 backdrop-blur-sm"
            placeholder="Project Name"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border-l-4 border-red-400 text-red-200 p-2 mx-4 mt-2 backdrop-blur-sm rounded text-sm flex-shrink-0">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Project Menu (Save/Load) */}
        <ProjectMenu />

        {/* MAIN AREA */}
        <div className="flex flex-1 overflow-hidden">
          <div className="flex flex-shrink-0">
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