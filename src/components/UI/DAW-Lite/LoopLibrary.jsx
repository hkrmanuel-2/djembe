import { useStore } from '../../../store/useStore.js';
import LoopButton from './Loopbutton.jsx';

export default function LoopLibrary({ onDragStart }) {
    // Load loops from Zustand store (which loads from database)
    const library = useStore((state) => state.library);
    const isLoading = useStore((state) => state.isLoading);
    const projectBpm = useStore((state) => state.project.bpm);
    
    // Filter loops to only show those matching the project BPM
    const filteredLibrary = library.filter((loop) => {
      // If loop doesn't have BPM, include it (backward compatibility)
      if (!loop.bpm) return true;
      // Only show loops that match the project BPM
      return loop.bpm === projectBpm;
    });

    return (
        <div className="w-[240px] border-r border-white/10 p-3 bg-white/5 backdrop-blur-sm flex flex-col h-full overflow-hidden">
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
                <h2 className="text-lg font-bold text-white">LOOPS</h2>
                <span className="text-xs text-white/70 bg-white/10 px-2 py-1 rounded border border-white/20">
                    {projectBpm} BPM
                </span>
            </div>

            <div className="flex-1 overflow-y-auto min-h-0">
                {isLoading ? (
                    <div className="flex flex-col gap-3">
                        <div className="w-full h-[50px] bg-white/10 rounded-lg animate-pulse"></div>
                        <div className="w-full h-[50px] bg-white/10 rounded-lg animate-pulse"></div>
                        <div className="w-full h-[50px] bg-white/10 rounded-lg animate-pulse"></div>
                    </div>
                ) : filteredLibrary.length === 0 ? (
                    <div className="text-center text-white/60 py-6">
                        <p className="text-sm">No loops</p>
                        <p className="text-xs mt-2">
                          {library.length === 0
                            ? 'Check database'
                            : `No ${projectBpm} BPM`}
                        </p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {filteredLibrary.map((loop) => (
                            <LoopButton key={loop.id} loop={loop} onDragStart={onDragStart} />
                        ))}
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-3 p-2 bg-blue-500/20 border border-blue-400/30 rounded-lg backdrop-blur-sm flex-shrink-0">
                <p className="text-xs text-blue-300 font-semibold mb-1">💡 Tips:</p>
                <ul className="text-[10px] text-blue-200/80 space-y-0.5">
                    <li>• Drag to timeline</li>
                    <li>• Click Play</li>
                    <li>• Save project</li>
                </ul>
            </div>
        </div>
    );
}