'use client'

import { cn } from "@/lib/utils";
import React from 'react'

interface CubeLoaderProps {
  className?: string;
  message?: string;
  subMessage?: string;
}

export default function CubeLoader({
  className,
  message = "Loading",
  subMessage = "Getting everything ready for you..."
}: CubeLoaderProps) {
  return (
    <div className={cn('relative flex flex-col items-center justify-center gap-12 p-12 min-h-[400px] overflow-hidden perspective-container', className)} style={{ background: 'linear-gradient(180deg, #3E2468 0%, #5B3D8F 50%, #7B5BA8 100%)', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
      `}</style>

      {/* Purple gradient background overlays */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#3E2468]/40 via-transparent to-[#42C9C9]/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#3E2468]/50 via-transparent to-[#D97746]/5" />
      </div>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-12 left-12 text-3xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite' }}>🎵</div>
        <div className="absolute top-20 right-16 text-2xl opacity-10" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>🎶</div>
        <div className="absolute bottom-16 left-1/4 text-4xl opacity-12" style={{ animation: 'float 3.5s ease-in-out infinite 2s' }}>⭐</div>
        <div className="absolute bottom-24 right-20 text-3xl opacity-15" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>✨</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* 3D Scene Wrapper */}
        <div className='relative w-24 h-24 flex items-center justify-center preserve-3d'>

          {/* THE SPINNING CUBE CONTAINER */}
          <div className='relative w-full h-full preserve-3d animate-cube-spin'>

            {/* Internal Core (The energy source) - Warm gold glow */}
            <div className='absolute inset-0 m-auto w-8 h-8 rounded-full blur-md animate-pulse-fast' style={{ backgroundColor: '#E6B84D', boxShadow: '0 0 40px rgba(230, 184, 77, 0.8)' }} />

            {/* CUBE FACES - Warm color theme */}

            {/* Front & Back - Orange accent */}
            <div className='side-wrapper front'>
              <div className='face' style={{ backgroundColor: 'rgba(217, 119, 70, 0.2)', border: '2px solid #D97746', boxShadow: '0 0 15px rgba(217, 119, 70, 0.5)' }} />
            </div>

            <div className='side-wrapper back'>
              <div className='face' style={{ backgroundColor: 'rgba(217, 119, 70, 0.2)', border: '2px solid #D97746', boxShadow: '0 0 15px rgba(217, 119, 70, 0.5)' }} />
            </div>

            {/* Right & Left - Teal accent */}
            <div className='side-wrapper right'>
              <div className='face' style={{ backgroundColor: 'rgba(74, 155, 155, 0.2)', border: '2px solid #42C9C9', boxShadow: '0 0 15px rgba(74, 155, 155, 0.5)' }} />
            </div>

            <div className='side-wrapper left'>
              <div className='face' style={{ backgroundColor: 'rgba(74, 155, 155, 0.2)', border: '2px solid #42C9C9', boxShadow: '0 0 15px rgba(74, 155, 155, 0.5)' }} />
            </div>

            {/* Top & Bottom - Gold accent */}
            <div className='side-wrapper top'>
              <div className='face' style={{ backgroundColor: 'rgba(230, 184, 77, 0.2)', border: '2px solid #E6B84D', boxShadow: '0 0 15px rgba(230, 184, 77, 0.5)' }} />
            </div>

            <div className='side-wrapper bottom'>
              <div className='face' style={{ backgroundColor: 'rgba(230, 184, 77, 0.2)', border: '2px solid #E6B84D', boxShadow: '0 0 15px rgba(230, 184, 77, 0.5)' }} />
            </div>
          </div>

          {/* Floor Shadow */}
          <div className='absolute -bottom-20 w-24 h-8 blur-xl rounded-[100%] animate-shadow-breathe' style={{ backgroundColor: 'rgba(217, 119, 70, 0.3)' }} />
        </div>

        {/* Loading Text - Warm theme */}
        <div className='flex flex-col items-center gap-2 mt-2'>
          <h3 className='text-xl font-bold tracking-[0.2em] uppercase' style={{ color: '#E6B84D', textShadow: '0 0 10px rgba(230, 184, 77, 0.3)' }}>
            {message}
          </h3>
          <p className='text-sm font-medium' style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
            {subMessage}
          </p>

          {/* Loading dots animation */}
          <div className="flex gap-1.5 mt-4">
            <div className="w-2 h-2 rounded-full animate-bounce-delay-0" style={{ backgroundColor: '#D97746' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce-delay-1" style={{ backgroundColor: '#E6B84D' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce-delay-2" style={{ backgroundColor: '#42C9C9' }}></div>
          </div>
        </div>
      </div>

      <style>{`
        .perspective-container {
          perspective: 1200px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        @keyframes cubeSpin {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        @keyframes breathe {
          0%, 100% { transform: translateZ(48px); opacity: 0.9; }
          50% { transform: translateZ(80px); opacity: 0.6; }
        }

        @keyframes pulse-fast {
          0%, 100% { transform: scale(0.9); opacity: 0.7; }
          50% { transform: scale(1.3); opacity: 1; }
        }

        @keyframes shadow-breathe {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.6); opacity: 0.3; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .animate-cube-spin {
          animation: cubeSpin 7s linear infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 1.5s ease-in-out infinite;
        }

        .animate-shadow-breathe {
          animation: shadow-breathe 2.5s ease-in-out infinite;
        }

        .animate-bounce-delay-0 {
          animation: bounce 1.4s ease-in-out infinite;
          animation-delay: 0s;
        }

        .animate-bounce-delay-1 {
          animation: bounce 1.4s ease-in-out infinite;
          animation-delay: 0.2s;
        }

        .animate-bounce-delay-2 {
          animation: bounce 1.4s ease-in-out infinite;
          animation-delay: 0.4s;
        }

        .side-wrapper {
          position: absolute;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          transform-style: preserve-3d;
        }

        .face {
          width: 100%;
          height: 100%;
          position: absolute;
          animation: breathe 2.5s ease-in-out infinite;
          backdrop-filter: blur(2px);
          border-radius: 6px;
        }

        .front  { transform: rotateY(0deg); }
        .back   { transform: rotateY(180deg); }
        .right  { transform: rotateY(90deg); }
        .left   { transform: rotateY(-90deg); }
        .top    { transform: rotateX(90deg); }
        .bottom { transform: rotateX(-90deg); }
      `}</style>
    </div>
  )
}
