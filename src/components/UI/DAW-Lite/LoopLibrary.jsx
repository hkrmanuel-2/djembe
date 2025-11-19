import { useStore } from '../../../store/useStore.js';
import LoopButton from './Loopbutton';

export default function LoopLibrary({ onDragStart }) {
    // Load loops from Zustand store (which loads from database)
    const library = useStore((state) => state.library);
    const isLoading = useStore((state) => state.isLoading);

    return (
        <div className="w-[280px] border-r border-black p-6 bg-gradient-to-b from-gray-50 to-gray-100">
            <h2 className="text-xl font-bold mb-6 text-black">LOOP LIBRARY</h2>

            {isLoading ? (
                <div className="flex flex-col gap-4">
                    <div className="w-full h-[65px] bg-gray-300 rounded-lg animate-pulse"></div>
                    <div className="w-full h-[65px] bg-gray-300 rounded-lg animate-pulse"></div>
                    <div className="w-full h-[65px] bg-gray-300 rounded-lg animate-pulse"></div>
                    <div className="w-full h-[65px] bg-gray-300 rounded-lg animate-pulse"></div>
                </div>
            ) : library.length === 0 ? (
                <div className="text-center text-gray-600 py-8">
                    <p className="text-sm">No loops available</p>
                    <p className="text-xs mt-2">Check database connection</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {library.map((loop) => (
                        <LoopButton key={loop.id} loop={loop} onDragStart={onDragStart} />
                    ))}
                </div>
            )}

            {/* Instructions */}
            <div className="mt-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
                <p className="text-sm text-blue-800 font-semibold mb-2">💡 How to use:</p>
                <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Drag loops to timeline</li>
                    <li>• Click Play to hear music</li>
                    <li>• Adjust BPM slider</li>
                    <li>• Save your project!</li>
                </ul>
            </div>
        </div>
    );
}