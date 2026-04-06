import React from "react";
import { useStore } from "../../../store/useStore.js";

export default function TransportControls({ isMobile }) {
    const transport = useStore((state) => state.transport);
    const togglePlay = useStore((state) => state.togglePlay);
    const stop = useStore((state) => state.stop);
    const rewind = useStore((state) => state.rewind);
    const setBpm = useStore((state) => state.setBpm);
    const audioInitialized = useStore((state) => state.audioInitialized);
    const assignmentContext = useStore((state) => state.assignmentContext);
    const bpmLocked = !!assignmentContext;

    const handleBpmChange = (e) => {
        setBpm(parseInt(e.target.value));
    };

    return (
        <div className="border-t border-white/10 p-2 md:p-3 flex items-center justify-center gap-3 md:gap-6 bg-white/5 backdrop-blur-sm flex-shrink-0">

            {/* REWIND */}
            <button
                onClick={rewind}
                disabled={!audioInitialized}
                className={`${isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'} border-2 border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
            >
                ⏮
            </button>

            {/* PLAY/PAUSE */}
            <button
                onClick={togglePlay}
                className={`${isMobile ? 'w-10 h-10 text-lg' : 'w-12 h-12 text-xl'} border-2 border-white/30 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-xl ${transport.isPlaying ? 'bg-yellow-400/20 hover:bg-yellow-400/30 text-yellow-300 shadow-[0_0_20px_rgba(250,204,21,0.4)]' : 'hover:bg-green-400/20 text-white'
                    }`}
            >
                {transport.isPlaying ? '⏸' : '▶'}
            </button>

            {/* STOP */}
            <button
                onClick={stop}
                disabled={!audioInitialized}
                className={`${isMobile ? 'w-8 h-8 text-sm' : 'w-10 h-10 text-lg'} border-2 border-white/20 rounded-full flex items-center justify-center text-white hover:bg-red-400/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg`}
            >
                ⏹
            </button>

            {/* BPM CONTROL */}
            <div className={`flex items-center gap-2 md:gap-3 ml-2 md:ml-4 bg-white/10 backdrop-blur-sm rounded-full ${isMobile ? 'px-2 py-1.5' : 'px-4 py-2'} border-2 border-white/20 shadow-lg`}>
                <span className="text-[10px] md:text-xs font-bold text-white/70">BPM</span>

                <button
                    onClick={() => setBpm(Math.max(60, transport.bpm - 5))}
                    disabled={bpmLocked}
                    className={`${isMobile ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'} rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                    −
                </button>

                {/* Hide slider on very small screens, show only on larger */}
                <input
                    type="range"
                    min="60"
                    max="180"
                    value={transport.bpm}
                    onChange={handleBpmChange}
                    disabled={bpmLocked}
                    className={`${isMobile ? 'w-[60px] h-[8px]' : 'w-[120px] h-[10px]'} bg-white/20 rounded-full appearance-none ${bpmLocked ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    style={{
                        background: `linear-gradient(to right, #60a5fa 0%, #60a5fa ${((transport.bpm - 60) / 120) * 100
                            }%, rgba(255,255,255,0.2) ${((transport.bpm - 60) / 120) * 100}%, rgba(255,255,255,0.2) 100%)`,
                    }}
                />

                <button
                    onClick={() => setBpm(Math.min(180, transport.bpm + 5))}
                    disabled={bpmLocked}
                    className={`${isMobile ? 'w-5 h-5 text-xs' : 'w-6 h-6 text-sm'} rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center font-bold text-white disabled:opacity-30 disabled:cursor-not-allowed`}
                >
                    +
                </button>

                <span className={`${isMobile ? 'text-sm w-8' : 'text-lg w-10'} font-semibold text-white text-center`}>
                    {transport.bpm}
                </span>
            </div>

            {!audioInitialized && (
                <div className="absolute bottom-1 right-2 text-[10px] text-yellow-400 font-semibold bg-black/50 px-2 py-1 rounded-full">
                    ⚠️ Click Play
                </div>
            )}
        </div>
    );
}