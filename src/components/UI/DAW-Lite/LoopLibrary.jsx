import React from 'react';
import LoopButton from "../LoopButton"

export default function LoopLibrary() {
    const loops = [
        { name: "Loop 1", color: "bg-red-500", hoverColor: "hover:bg-red-600", icon: "🔄" },
        { name: "Loop 2", color: "bg-blue-500", hoverColor: "hover:bg-blue-600", icon: "🔄" },
        { name: "Loop 3", color: "bg-green-500", hoverColor: "hover:bg-green-600", icon: "🔄" },
        { name: "Loop 4", color: "bg-yellow-500", hoverColor: "hover:bg-yellow-600", icon: "🔄" },
    ];
    return (
        <div className="w-[260px] border-r border-black p-6">
            <h2 className="text-xl font-bold mb-6 text-black">LOOP LIBRARY</h2>

            <div className="flex flex-col gap-5">
                <div className="w-full h-[50px] bg-gray-300 rounded-md"></div>
                <div className="w-full h-[50px] bg-gray-300 rounded-md"></div>
                <div className="w-full h-[50px] bg-gray-300 rounded-md"></div>
                <div className="w-full h-[50px] bg-gray-300 rounded-md"></div>
            </div>

            <div className="flex flex-col gap-4">
                {loops.map((loop, index) => (
                <LoopButton key={index} loop={loop} onDragStart={onDragStart} />
            ))}
      </div>

        </div>
    );
}