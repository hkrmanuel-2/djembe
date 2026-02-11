import { cn } from "@/lib/utils";
import React from 'react';

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
    <div className={cn('relative flex flex-col items-center justify-center gap-12 p-12 min-h-screen overflow-hidden perspective-container', className)} style={{ background: 'linear-gradient(180deg, #3E2468 0%, #5B3D8F 50%, #7B5BA8 100%)', fontFamily: "'Outfit', sans-serif" }}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
      `}</style>

      {/* Fun Floating Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-16 text-4xl opacity-20" style={{ animation: 'float 4s ease-in-out infinite' }}>🎵</div>
        <div className="absolute top-32 right-20 text-3xl opacity-25" style={{ animation: 'float 5s ease-in-out infinite 1s' }}>🎶</div>
        <div className="absolute bottom-28 left-1/4 text-5xl opacity-15" style={{ animation: 'float 3.5s ease-in-out infinite 2s' }}>⭐</div>
        <div className="absolute top-1/3 right-12 text-4xl opacity-20" style={{ animation: 'float 4.5s ease-in-out infinite 0.5s' }}>✨</div>
        <div className="absolute bottom-40 right-1/3 text-3xl opacity-25" style={{ animation: 'float 3s ease-in-out infinite 1.5s' }}>🪘</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* 3D Scene Wrapper */}
        <div className='relative w-24 h-24 flex items-center justify-center preserve-3d'>
          <div className='relative w-full h-full preserve-3d animate-cube-spin'>
            {/* Internal Core */}
            <div className='absolute inset-0 m-auto w-8 h-8 rounded-full blur-md animate-pulse-fast' style={{ backgroundColor: '#F2C94C', boxShadow: '0 0 40px rgba(242, 201, 76, 0.8)' }} />

            {/* Front & Back - Coral */}
            <div className='side-wrapper front'>
              <div className='face' style={{ backgroundColor: 'rgba(217, 119, 70, 0.25)', border: '2px solid #D97746', boxShadow: '0 0 20px rgba(217, 119, 70, 0.5)' }} />
            </div>
            <div className='side-wrapper back'>
              <div className='face' style={{ backgroundColor: 'rgba(217, 119, 70, 0.25)', border: '2px solid #D97746', boxShadow: '0 0 20px rgba(217, 119, 70, 0.5)' }} />
            </div>

            {/* Right & Left - Teal */}
            <div className='side-wrapper right'>
              <div className='face' style={{ backgroundColor: 'rgba(66, 201, 201, 0.25)', border: '2px solid #42C9C9', boxShadow: '0 0 20px rgba(66, 201, 201, 0.5)' }} />
            </div>
            <div className='side-wrapper left'>
              <div className='face' style={{ backgroundColor: 'rgba(66, 201, 201, 0.25)', border: '2px solid #42C9C9', boxShadow: '0 0 20px rgba(66, 201, 201, 0.5)' }} />
            </div>

            {/* Top & Bottom - Gold */}
            <div className='side-wrapper top'>
              <div className='face' style={{ backgroundColor: 'rgba(242, 201, 76, 0.25)', border: '2px solid #F2C94C', boxShadow: '0 0 25px rgba(242, 201, 76, 0.5)' }} />
            </div>
            <div className='side-wrapper bottom'>
              <div className='face' style={{ backgroundColor: 'rgba(242, 201, 76, 0.25)', border: '2px solid #F2C94C', boxShadow: '0 0 25px rgba(242, 201, 76, 0.5)' }} />
            </div>
          </div>

          {/* Floor Shadow */}
          <div className='absolute -bottom-20 w-24 h-8 blur-xl rounded-[100%] animate-shadow-breathe' style={{ backgroundColor: 'rgba(155, 125, 200, 0.4)' }} />
        </div>

        {/* Loading Text */}
        <div className='flex flex-col items-center gap-2 mt-2'>
          <h3 className='text-xl font-bold tracking-[0.2em] uppercase' style={{ color: '#F2C94C', textShadow: '0 0 10px rgba(242, 201, 76, 0.3)', fontFamily: "'Fredoka', sans-serif" }}>
            {message}
          </h3>
          <p className='text-sm font-medium' style={{ color: 'rgba(255, 255, 255, 0.7)' }}>
            {subMessage}
          </p>

          {/* Loading dots */}
          <div className="flex gap-1.5 mt-4">
            <div className="w-2 h-2 rounded-full animate-bounce-delay-0" style={{ backgroundColor: '#D97746' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce-delay-1" style={{ backgroundColor: '#F2C94C' }}></div>
            <div className="w-2 h-2 rounded-full animate-bounce-delay-2" style={{ backgroundColor: '#42C9C9' }}></div>
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
