import React from "react";

export default function LoopButton({ loop, onDragStart }) {
  return (
    <button
      draggable
      onDragStart={() => onDragStart(loop)}
      className={`w-full h-[65px] ${loop.color} ${loop.hoverColor} rounded-lg border-2 border-black flex items-center gap-4 px-4 transition-colors cursor-grab active:cursor-grabbing`}
    >
      <div className="text-3xl">{loop.icon}</div>
      <span className="text-lg font-semibold text-black">{loop.name}</span>
    </button>
  );
}