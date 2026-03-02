import React from "react";

export default function LoopButton({ loop, onDragStart, onSelect, isSelected, isMobile }) {
  const handleTouchStart = () => {
    // For mobile: tap to select, then tap timeline to place
    if (onSelect) {
      onSelect(loop);
    }
  };

  return (
    <button
      draggable
      onDragStart={() => onDragStart(loop)}
      onTouchStart={handleTouchStart}
      onClick={() => onSelect && onSelect(loop)}
      className={`w-full ${isMobile ? 'h-[50px]' : 'h-[65px]'} ${loop.color} ${loop.hoverColor} rounded-lg border-2 ${isSelected ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-black'} flex items-center gap-2 md:gap-3 px-2 md:px-3 transition-colors cursor-grab active:cursor-grabbing overflow-hidden`}
      title={loop.name}
    >
      <div className={`${isMobile ? 'text-lg' : 'text-2xl'} flex-shrink-0`}>{loop.icon}</div>
      <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-black truncate flex-1 text-left`}>{loop.name}</span>
    </button>
  );
}