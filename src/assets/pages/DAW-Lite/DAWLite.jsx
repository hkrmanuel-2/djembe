import React, { useState, useEffect } from "react";
import { useStore } from "../../../store/useStore.js";
import LoopLibrary from "../../../components/UI/DAW-Lite/LoopLibrary.jsx";
import Timeline from "../../../components/UI/DAW-Lite/Timeline.jsx";
import TransportControls from "../../../components/UI/DAW-Lite/Transportcontrols.jsx";
import ProjectMenu from "../../../components/UI/DAW-Lite/Projectmenu.jsx";

export default function DAWLite() {
  const [draggedLoop, setDraggedLoop] = useState(null);

  // Get state from Zustand store
  const placedLoops = useStore((state) => state.project.placedLoops);
  const isPlaying = useStore((state) => state.transport.isPlaying);
  const bpm = useStore((state) => state.transport.bpm);
  const currentBeat = useStore((state) => state.transport.currentBeat);
  const projectName = useStore((state) => state.project.name);
  const error = useStore((state) => state.error);
  const audioInitialized = useStore((state) => state.audioInitialized);

  // Get actions from store
  const loadLoops = useStore((state) => state.loadLoops);
  const initAudio = useStore((state) => state.initAudio);
  const addPlacedLoop = useStore((state) => state.addPlacedLoop);
  const removePlacedLoop = useStore((state) => state.removePlacedLoop);
  const setProjectName = useStore((state) => state.setProjectName);

  // Load loops from database on mount
  useEffect(() => {
    loadLoops();
  }, [loadLoops]);

  // Initialize audio when loops are loaded
  useEffect(() => {
    if (!audioInitialized) {
      initAudio();
    }
  }, [audioInitialized, initAudio]);

  const handleDragStart = (loop) => {
    setDraggedLoop(loop);
  };

  const handleDrop = (row, col) => {
    if (draggedLoop) {
      const newLoop = {
        id: Date.now(),
        loopId: draggedLoop.id,
        type: draggedLoop.name,
        color: draggedLoop.color,
        border: draggedLoop.border,
        icon: draggedLoop.icon,
        row,
        col,
        span: 2,
      };
      addPlacedLoop(newLoop);
      setDraggedLoop(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
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
              <div className={`w-2 h-2 rounded-full ${audioInitialized ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-xs text-gray-600">
                {audioInitialized ? 'Audio Ready' : 'Initializing...'}
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
          <LoopLibrary onDragStart={handleDragStart} />

          <Timeline
            placedLoops={placedLoops}
            currentBeat={currentBeat}
            isPlaying={isPlaying}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            removeLoop={removePlacedLoop}
          />
        </div>

        {/* Transport Controls */}
        <TransportControls />
      </div>
    </div>
  );
}