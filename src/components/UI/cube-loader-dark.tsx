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
    <div className={cn('relative flex flex-col items-center justify-center gap-12 p-12 min-h-screen bg-black overflow-hidden perspective-container', className)}>

      {/* CloudShader Background */}
      <div className="absolute inset-0 z-0">
        <CloudShader
          speed={0.3}
          octaves={5}
          scale={2.5}
          className="w-full h-full opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/50" />
      </div>

      {/* Fun Doodles */}
      <div className="absolute inset-0 z-[5] pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-16 text-4xl opacity-15 animate-bounce" style={{animationDuration: '3s'}}>🎵</div>
        <div className="absolute top-32 right-20 text-3xl opacity-20 animate-bounce" style={{animationDuration: '4s', animationDelay: '1s'}}>🎶</div>
        <div className="absolute bottom-28 left-1/4 text-5xl opacity-10 animate-bounce" style={{animationDuration: '5s', animationDelay: '2s'}}>⭐</div>
        <div className="absolute top-1/3 right-12 text-4xl opacity-15 animate-bounce" style={{animationDuration: '4.5s', animationDelay: '0.5s'}}>✨</div>
      </div>

      {/* Content Layer */}
      <div className="relative z-10 flex flex-col items-center gap-12">
        {/* 3D Scene Wrapper */}
        <div className='relative w-24 h-24 flex items-center justify-center preserve-3d'>

          {/* THE SPINNING CUBE CONTAINER */}
          <div className='relative w-full h-full preserve-3d animate-cube-spin'>

            {/* Internal Core (The energy source) - White glow for dark theme */}
            <div className='absolute inset-0 m-auto w-8 h-8 bg-white rounded-full blur-md shadow-[0_0_40px_rgba(255,255,255,0.6)] animate-pulse-fast' />

            {/* CUBE FACES - White/Gray theme with glow */}

            {/* Front */}
            <div className='side-wrapper front'>
              <div className='face bg-white/10 border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)]' />
            </div>

            {/* Back */}
            <div className='side-wrapper back'>
              <div className='face bg-white/10 border-2 border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.3)]' />
            </div>

            {/* Right */}
            <div className='side-wrapper right'>
              <div className='face bg-white/5 border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]' />
            </div>

            {/* Left */}
            <div className='side-wrapper left'>
              <div className='face bg-white/5 border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.2)]' />
            </div>

            {/* Top */}
            <div className='side-wrapper top'>
              <div className='face bg-white/15 border-2 border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.4)]' />
            </div>

            {/* Bottom */}
            <div className='side-wrapper bottom'>
              <div className='face bg-white/15 border-2 border-white/40 shadow-[0_0_25px_rgba(255,255,255,0.4)]' />
            </div>
          </div>

          {/* Floor Shadow (Scales with the breathing) */}
          <div className='absolute -bottom-20 w-24 h-8 bg-white/20 blur-xl rounded-[100%] animate-shadow-breathe' />
        </div>

        {/* Loading Text - Dark theme */}
        <div className='flex flex-col items-center gap-2 mt-2'>
          <h3 className='text-xl font-bold tracking-[0.2em] text-white uppercase drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]'>
            {message}
          </h3>
          <p className='text-sm text-white/60 font-medium'>
            {subMessage}
          </p>

          {/* Loading dots animation */}
          <div className="flex gap-1 mt-4">
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce-delay-0"></div>
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce-delay-1"></div>
            <div className="w-2 h-2 rounded-full bg-white/60 animate-bounce-delay-2"></div>
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

        /* 1. Cube Spin - Slower, more elegant */
        @keyframes cubeSpin {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        /* 2. Face Breathing - Subtle glow change */
        @keyframes breathe {
          0%, 100% {
            transform: translateZ(48px);
            opacity: 0.9;
            box-shadow: 0 0 20px rgba(255,255,255,0.3);
          }
          50% {
            transform: translateZ(80px);
            opacity: 0.6;
            border-color: rgba(255,255,255,0.6);
            box-shadow: 0 0 30px rgba(255,255,255,0.5);
          }
        }

        @keyframes pulse-fast {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.7;
            box-shadow: 0 0 40px rgba(255,255,255,0.4);
          }
          50% {
            transform: scale(1.3);
            opacity: 1;
            box-shadow: 0 0 60px rgba(255,255,255,0.8);
          }
        }

        @keyframes shadow-breathe {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.6); opacity: 0.15; }
        }

        /* Bounce animations for dots */
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

        /* Positioning the Sides */
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
          border-radius: 4px;
        }

        /* Rotations to form the cube structure */
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
