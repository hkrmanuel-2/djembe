import React from "react";
import { useStore } from "../../../store/useStore.js";

export default function TransportControls() {
    const transport = useStore((state) => state.transport);
    const togglePlay = useStore((state) => state.togglePlay);
    const stop = useStore((state) => state.stop);
    const rewind = useStore((state) => state.rewind);
    const setBpm = useStore((state) => state.setBpm);
    const audioInitialized = useStore((state) => state.audioInitialized);

    const handleBpmChange = (e) => {
        setBpm(parseInt(e.target.value));
    };

    return (
        <div className="border-t border-black p-6 flex items-center justify-center gap-10 bg-[#eaf5f9]">

            {/* REWIND */}
            <button
                onClick={rewind}
                disabled={!audioInitialized}
                className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center text-xl hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ⏮
            </button>

            {/* PLAY/PAUSE */}
            <button
                onClick={togglePlay}
                disabled={!audioInitialized}
                className={`w-16 h-16 border-2 border-black rounded-full flex items-center justify-center text-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 active:scale-95 ${transport.isPlaying ? 'bg-yellow-200 hover:bg-yellow-300' : 'hover:bg-green-200'
                    }`}
            >
                {transport.isPlaying ? '⏸' : '▶'}
            </button>

            {/* STOP */}
            <button
                onClick={stop}
                disabled={!audioInitialized}
                className="w-14 h-14 border-2 border-black rounded-full flex items-center justify-center text-xl hover:bg-red-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                ⏹
            </button>

            {/* BPM CONTROL */}
            <div className="flex items-center gap-4 ml-8 bg-white rounded-full px-6 py-3 border-2 border-gray-300">
                <span className="text-sm font-bold text-gray-600">BPM</span>

                <button
                    onClick={() => setBpm(Math.max(60, transport.bpm - 5))}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700"
                >
                    −
                </button>

                <input
                    type="range"
                    min="60"
                    max="180"
                    value={transport.bpm}
                    onChange={handleBpmChange}
                    className="w-[150px] h-[12px] bg-gray-400 rounded-full appearance-none cursor-pointer"
                    style={{
                        background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${((transport.bpm - 60) / 120) * 100
                            }%, #9ca3af ${((transport.bpm - 60) / 120) * 100}%, #9ca3af 100%)`,
                    }}
                />

                <button
                    onClick={() => setBpm(Math.min(180, transport.bpm + 5))}
                    className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center font-bold text-gray-700"
                >
                    +
                </button>

                <span className="text-xl font-semibold text-black w-12 text-center">
                    {transport.bpm}
                </span>
            </div>

            {!audioInitialized && (
                <div className="absolute bottom-2 right-2 text-xs text-red-600 font-semibold">
                    ⚠️ Click Play to initialize audio
                </div>
            )}
        </div>
    );
}