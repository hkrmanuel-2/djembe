import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useStore } from "../../../store/useStore.js";
import LoopLibrary from "../../../components/ui/DAW-Lite/LoopLibrary.jsx";
import Timeline from "../../../components/ui/DAW-Lite/Timeline.jsx";
import TransportControls from "../../../components/ui/DAW-Lite/Transportcontrols.jsx";
import ProjectMenu from "../../../components/ui/DAW-Lite/Projectmenu.jsx";
import AILoopGenerator from "../../../components/ui/DAW-Lite/AILoopGenerator.jsx";
import { Home, RotateCcw, Smartphone } from "lucide-react";
import { logger } from "../../../lib/logger";

export default function DAWLite() {
  const [draggedLoop, setDraggedLoop] = useState(null);
  const [selectedLoop, setSelectedLoop] = useState(null); // For mobile tap-to-place
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true); // For toggling loop library on mobile
  const navigate = useNavigate();

  // Check for portrait mode and mobile device
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      const mobile = window.innerWidth < 1024; // Consider tablets and phones
      setIsPortrait(portrait);
      setIsMobile(mobile);
      // Auto-hide sidebar on small screens
      if (window.innerWidth < 768) {
        setShowSidebar(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

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

      // Short preview sound (just 1.5 seconds, not the whole loop)
      if (newLoop.url) {
        const audio = new Audio(newLoop.url);
        audio.volume = 0.8;
        audio.play().catch((err) => logger.log("Audio play error:", err));
        // Stop after 1.5 seconds for a quick preview
        setTimeout(() => {
          audio.pause();
          audio.currentTime = 0;
        }, 1500);
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
    logger.log('New AI loop generated:', newLoop);
  };

  // Handle loop selection for mobile tap-to-place flow
  const handleSelectLoop = (loop) => {
    setSelectedLoop(loop);
    setDraggedLoop(loop); // Also set as dragged for compatibility
  };

  // Handle timeline click/tap to place selected loop (mobile-friendly)
  const handleTimelineClick = async (row, col) => {
    if (!selectedLoop) return;

    // Calculate span based on audio duration
    const span = selectedLoop.url
      ? await calculateSpan(selectedLoop.url, 4)
      : 64;

    // Check if loop extends beyond current timeline
    const subdivisionsPerBeat = 4;
    const beatsPerBar = 4;
    const loopEndCol = col + span;
    const requiredBars = Math.ceil(loopEndCol / (beatsPerBar * subdivisionsPerBeat));

    if (requiredBars > (projectBars || 10)) {
      updateProjectDimensions(requiredBars, 5);
    }

    const newLoop = {
      id: Date.now(),
      loopId: selectedLoop.id,
      type: selectedLoop.name,
      color: selectedLoop.color,
      border: selectedLoop.border,
      icon: selectedLoop.icon,
      url: selectedLoop.url,
      row,
      col,
      span,
    };

    // Remove overlapping loops
    const overlappingLoops = placedLoops.filter(loop =>
      loop.row === row &&
      (col < loop.col + loop.span && col + span > loop.col)
    );
    overlappingLoops.forEach(loop => removePlacedLoop(loop.id));

    addPlacedLoop(newLoop);

    // Short preview sound
    if (newLoop.url) {
      const audio = new Audio(newLoop.url);
      audio.volume = 0.8;
      audio.play().catch((err) => logger.log("Audio play error:", err));
      setTimeout(() => {
        audio.pause();
        audio.currentTime = 0;
      }, 1500);
    }

    // Clear selection after placing
    setSelectedLoop(null);
    setDraggedLoop(null);
  };

  return (
    <div className="h-screen relative overflow-hidden flex items-center justify-center p-2 md:p-4" style={{ background: 'linear-gradient(180deg, #2A1845 0%, #3E2468 50%, #2A1845 100%)', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        @keyframes pulse-rotate {
          0%, 100% { transform: rotate(-15deg) scale(1); }
          50% { transform: rotate(-15deg) scale(1.1); }
        }
      `}</style>

      {/* Portrait Mode Overlay - Forces landscape on mobile */}
      {isPortrait && isMobile && (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-8" style={{ background: 'linear-gradient(180deg, #2A1845 0%, #3E2468 50%, #2A1845 100%)' }}>
          <div className="text-center max-w-sm">
            {/* Rotating phone icon */}
            <div className="mb-6 relative">
              <Smartphone
                size={80}
                className="text-[#E6B84D] mx-auto"
                style={{ animation: 'pulse-rotate 2s ease-in-out infinite' }}
              />
              <RotateCcw
                size={32}
                className="text-[#42C9C9] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
              />
            </div>

            <h2 className="text-2xl font-bold text-white mb-3">
              Rotate Your Device
            </h2>

            <p className="text-white/70 mb-6">
              Music Studio works best in <span className="text-[#E6B84D] font-semibold">landscape mode</span>.
              Please rotate your device horizontally to continue.
            </p>

            <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
              <div className="w-12 h-8 border-2 border-white/30 rounded-md flex items-center justify-center">
                <div className="w-8 h-4 bg-white/20 rounded-sm"></div>
              </div>
              <span>→</span>
              <div className="w-16 h-10 border-2 border-[#E6B84D] rounded-md flex items-center justify-center">
                <div className="w-10 h-6 bg-[#E6B84D]/20 rounded-sm"></div>
              </div>
            </div>

            <button
              onClick={() => navigate('/home')}
              className="mt-8 px-6 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      )}

      {/* Purple gradient background with subtle color overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3E2468]/40 via-transparent to-[#42C9C9]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2A1845]/50 via-transparent to-[#D97746]/5" />
      </div>

      {/* Fun Musical Doodles - Hidden on mobile */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden hidden md:block">
        <div className="absolute top-20 left-12 text-3xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite' }}>🎵</div>
        <div className="absolute top-1/4 right-24 text-2xl opacity-10" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>🎶</div>
        <div className="absolute bottom-32 left-1/4 text-4xl opacity-12" style={{ animation: 'float 3.5s ease-in-out infinite 2s' }}>⭐</div>
        <div className="absolute top-2/3 right-16 text-3xl opacity-15" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>✨</div>
      </div>

      <div className="relative z-10 w-full h-full max-w-[1800px] backdrop-blur-md rounded-xl md:rounded-2xl border shadow-2xl overflow-hidden flex flex-col" style={{ backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }}>

        {/* HEADER - Responsive */}
        <div className="flex items-center justify-between px-2 md:px-4 py-1.5 md:py-2 border-b flex-shrink-0" style={{ borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)' }}>
          <div className="flex items-center gap-2 md:gap-3">
            {/* Home Button */}
            <button
              onClick={() => navigate('/home')}
              className="p-1.5 md:p-2 rounded-full hover:bg-white/10 transition-colors"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)' }}
              title="Go to Home"
            >
              <Home size={isMobile ? 16 : 20} style={{ color: '#E6B84D' }} />
            </button>

            <h1 className="text-lg md:text-2xl font-bold tracking-wide text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>
              <span style={{ color: '#D97746' }}>Music</span><span className="hidden sm:inline" style={{ color: '#F2C94C' }}> Studio</span>
            </h1>

            {/* Audio Status Indicator - Hidden on very small screens */}
            <div className="hidden sm:flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${audioInitialized ? 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.6)]' : 'shadow-[0_0_8px_rgba(230,184,77,0.6)]'}`} style={{ backgroundColor: audioInitialized ? '#4ADE80' : '#E6B84D' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {audioInitialized ? 'Ready' : 'Click Play'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Sidebar Button - Mobile only */}
            {isMobile && (
              <button
                onClick={() => setShowSidebar(!showSidebar)}
                className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white text-xs font-semibold"
                style={{ backgroundColor: showSidebar ? 'rgba(230,184,77,0.3)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
              >
                {showSidebar ? '◀ Hide' : '▶ Loops'}
              </button>
            )}

            {/* Editable Project Name - Responsive width */}
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-[120px] sm:w-[180px] md:w-[250px] h-[28px] md:h-[32px] border-2 rounded-full px-3 md:px-4 text-center font-semibold text-xs md:text-sm text-white placeholder:text-white/40 focus:outline-none backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)', borderColor: 'rgba(255,255,255,0.2)' }}
              placeholder="Project Name"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="border-l-4 p-2 mx-2 md:mx-4 mt-1 md:mt-2 backdrop-blur-sm rounded text-xs md:text-sm flex-shrink-0" style={{ backgroundColor: 'rgba(220, 38, 38, 0.15)', borderColor: '#DC2626', color: '#FCA5A5' }}>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}

        {/* Project Menu (Save/Load) */}
        <ProjectMenu isMobile={isMobile} />

        {/* MAIN AREA - Responsive layout */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar - Collapsible on mobile */}
          <div className={`flex flex-shrink-0 transition-all duration-300 ${showSidebar ? 'w-auto' : 'w-0 overflow-hidden'}`}>
            {!isMobile && <AILoopGenerator onLoopGenerated={handleLoopGenerated} />}
            <LoopLibrary
              onDragStart={handleDragStart}
              selectedLoop={selectedLoop}
              onSelectLoop={handleSelectLoop}
              isMobile={isMobile}
            />
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
            selectedLoop={selectedLoop}
            onTimelineClick={handleTimelineClick}
            isMobile={isMobile}
          />
        </div>

        {/* Transport Controls */}
        <TransportControls isMobile={isMobile} />

        {/* Mascot - bottom right corner */}
        <div className="hidden md:block absolute bottom-10 right-2 z-[20] pointer-events-none">
          {/* Speech bubble - positioned to the left of mascot */}
          <div
            className="absolute -left-28 top-6 px-4 py-3 rounded-2xl"
            style={{
              background: 'white',
              boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
              animation: 'float 4s ease-in-out infinite',
            }}
          >
            <p className="text-sm font-bold whitespace-nowrap" style={{ color: '#3E2468', fontFamily: "'Fredoka', sans-serif" }}>
              Let's make some<br />magic!
            </p>
            {/* Triangle pointer pointing right */}
            <div
              className="absolute top-1/2 -right-2 -translate-y-1/2 w-0 h-0"
              style={{
                borderTop: '8px solid transparent',
                borderBottom: '8px solid transparent',
                borderLeft: '8px solid white',
              }}
            />
          </div>

          {/* Mascot image - large */}
          <div className="w-[180px] h-[220px] overflow-hidden" style={{ animation: 'float 4s ease-in-out infinite 0.5s' }}>
            <img
              src="/ui assets/djemb_fullbody.png"
              alt="Djembe mascot"
              className="w-[300%] h-[300%] max-w-none"
              style={{
                transform: 'translate(-66.666%, -33.333%)',
                filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.35))',
                imageRendering: 'auto',
              }}
            />
          </div>
        </div>

        {/* Click Play indicator - bottom right */}
        {!audioInitialized && (
          <div className="hidden md:flex absolute bottom-2 right-3 z-[20] pointer-events-none items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ background: 'linear-gradient(135deg, #D97746, #E6945A)', boxShadow: '0 2px 10px rgba(217,119,70,0.4)' }}>
            <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            <span className="text-xs font-bold text-white" style={{ fontFamily: "'Fredoka', sans-serif" }}>Click Play</span>
          </div>
        )}
      </div>
    </div>
  );
}
