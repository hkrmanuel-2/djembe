import React, { useState, useEffect, useRef } from "react";
import LoopLibrary from "../../components/UI/DAW-Lite/LoopLibrary.jsx";


export default function DAWLite() {

  const [draggedLoop, setDraggedLoop] = useState(null);
  const [placedLoops, setPlacedLoops] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bpm, setBpm] = useState(120);
  const [currentBeat, setCurrentBeat] = useState(0);
  const intervalRef = useRef(null);

  // Playback logic
  useEffect(() => {
    if (isPlaying) {
      const beatDuration = (60 / bpm) * 1000 / 2;
      intervalRef.current = setInterval(() => {
        setCurrentBeat((prev) => (prev + 1) % 8);
      }, beatDuration);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, bpm]);

  const handleDragStart = (loop) => {
    setDraggedLoop(loop);
  };

  const handleDrop = (row, col) => {
    if (draggedLoop) {
      const newLoop = {
        id: Date.now(),
        type: draggedLoop.name,
        color: draggedLoop.color,
        border: draggedLoop.border,
        row,
        col,
        span: 2,
      };
      setPlacedLoops([...placedLoops, newLoop]);
      setDraggedLoop(null);
    }
  };

  const removeLoop = (id) => {
    setPlacedLoops(placedLoops.filter(loop => loop.id !== id));
  };

  const handlePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentBeat(0);
  };

  const handleRewind = () => {
    setCurrentBeat(0);
  };

  const handleBpmChange = (e) => {
    setBpm(parseInt(e.target.value));
  };

  return (
    <div className="min-h-screen bg-[#cfeefa] flex items-center justify-center p-6">
      <div className="w-full max-w-[1800px] bg-[#eaf5f9] rounded-xl border border-black shadow-lg overflow-hidden">

        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-black">
          <h1 className="text-3xl font-bold text-[#003c82] tracking-wide">DAW-LITE</h1>

          <div className="w-[350px] h-[40px] bg-gray-300 rounded-full"></div>
        </div>

        {/* MAIN AREA */}
        <div className="flex">

          {/* LOOP LIBRARY */}
          <LoopLibrary />

          {/* TIMELINE GRID */}
          <div className="flex-1 p-6">
            <div className="grid grid-cols-10 grid-rows-5 gap-0 border border-black">
              {Array.from({ length: 60 }).map((_, i) => (
                <div key={i} className="border border-black h-[100px] bg-[#e9f4f8]"></div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER / TRANSPORT */}
        <div className="border-t border-black p-6 flex items-center justify-center gap-10 bg-[#eaf5f9]">

          {/* REWIND */}
          <button className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center text-xl hover:bg-gray-200">
            ⏮
          </button>

          {/* PLAY */}
          <button className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center text-xl hover:bg-gray-200">
            ▶
          </button>

          {/* STOP */}
          <button className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center text-xl hover:bg-gray-200">
            ⏹
          </button>

          {/* BPM CONTROL */}
          <div className="flex items-center gap-3 ml-6">
            <div className="w-[150px] h-[12px] bg-gray-400 rounded-full relative">
              <div className="absolute left-[50%] top-1/2 transform -translate-y-1/2 w-[20px] h-[20px] bg-black rounded-full"></div>
            </div>
            <span className="text-xl font-semibold text-black">120</span>
          </div>

        </div>

      </div>
    </div>
  );
}