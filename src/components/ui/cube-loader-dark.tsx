import { cn } from "@/lib/utils";
import React from 'react';
import CloudShader from "./cloud-shader";

interface CubeLoaderProps {
  className?: string;
  message?: string;
  subMessage?: string;
}

export default function CubeLoaderDark({
  className,
  message = "Loading",
  subMessage = "Taking you somewhere awesome..."
}: CubeLoaderProps) {
  return (
    <div className={cn('relative flex flex-col items-center justify-center gap-12 p-12 min-h-screen overflow-hidden perspective-container', className)} style={{ backgroundColor: '#1A2B4A', fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* CloudShader Background */}
      <div className="absolute inset-0 z-0">
        <CloudShader
          speed={0.2}
          octaves={5}
          scale={2.5}
          className="w-full h-full opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#1A2B4A]/90 via-[#1A2B4A]/70 to-[#4A9B9B]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2B4A]/80 via-transparent to-[#D97746]/10" />
      </div>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-16 text-4xl opacity-15" style={{ animation: 'float 4s ease-in-out infinite' }}>🎵</div>
        <div className="absolute top-32 right-20 text-3xl opacity-20" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>🎶</div>
        <div className="absolute bottom-28 left-1/4 text-5xl opacity-10" style={{ animation: 'float 3.5s ease-in-out infinite 2s' }}>⭐</div>
        <div className="absolute top-1/3 right-12 text-4xl opacity-15" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>✨</div>
        <div className="absolute bottom-40 right-1/3 text-3xl opacity-20" style={{ animation: 'float 3s ease-in-out infinite 1.5s' }}>🪘</div>
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
              <div className='face' style={{ backgroundColor: 'rgba(217, 119, 70, 0.2)', border: '2px solid #D97746', boxShadow: '0 0 20px rgba(217, 119, 70, 0.5)' }} />
            </div>

            <div className='side-wrapper back'>
              <div className='face' style={{ backgroundColor: 'rgba(217, 119, 70, 0.2)', border: '2px solid #D97746', boxShadow: '0 0 20px rgba(217, 119, 70, 0.5)' }} />
            </div>

            {/* Right & Left - Teal accent */}
            <div className='side-wrapper right'>
              <div className='face' style={{ backgroundColor: 'rgba(74, 155, 155, 0.2)', border: '2px solid #4A9B9B', boxShadow: '0 0 20px rgba(74, 155, 155, 0.5)' }} />
            </div>

            <div className='side-wrapper left'>
              <div className='face' style={{ backgroundColor: 'rgba(74, 155, 155, 0.2)', border: '2px solid #4A9B9B', boxShadow: '0 0 20px rgba(74, 155, 155, 0.5)' }} />
            </div>

            {/* Top & Bottom - Gold accent */}
            <div className='side-wrapper top'>
              <div className='face' style={{ backgroundColor: 'rgba(230, 184, 77, 0.2)', border: '2px solid #E6B84D', boxShadow: '0 0 25px rgba(230, 184, 77, 0.5)' }} />
            </div>

            <div className='side-wrapper bottom'>
              <div className='face' style={{ backgroundColor: 'rgba(230, 184, 77, 0.2)', border: '2px solid #E6B84D', boxShadow: '0 0 25px rgba(230, 184, 77, 0.5)' }} />
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
            <div className="w-2 h-2 rounded-full animate-bounce-delay-2" style={{ backgroundColor: '#4A9B9B' }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
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
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 0.15; }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }

        .animate-cube-spin {
          animation: cubeSpin 8s linear infinite;
        }

        .animate-pulse-fast {
          animation: pulse-fast 2s ease-in-out infinite;
        }

        .animate-shadow-breathe {
          animation: shadow-breathe 3s ease-in-out infinite;
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
          animation: breathe 3s ease-in-out infinite;
          backdrop-filter: blur(4px);
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
