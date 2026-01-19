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
    <div className={cn('flex flex-col items-center justify-center gap-12 p-12 min-h-[400px] bg-gradient-to-b from-sky-200 via-blue-100 to-purple-100 perspective-container', className)}>
      
      {/* 3D Scene Wrapper */}
      <div className='relative w-24 h-24 flex items-center justify-center preserve-3d'>
        
        {/* THE SPINNING CUBE CONTAINER */}
        <div className='relative w-full h-full preserve-3d animate-cube-spin'>
          
          {/* Internal Core (The energy source) - More playful colors */}
          <div className='absolute inset-0 m-auto w-8 h-8 bg-yellow-300 rounded-full blur-md shadow-[0_0_40px_rgba(255,235,59,0.8)] animate-pulse-fast' />

          {/* CUBE FACES 
              We wrap each face in a 'side-wrapper' that handles the rotation (facing direction),
              and the inner 'face' handles the breathing (expansion/contraction) animation.
          */}

          {/* Front */}
          <div className='side-wrapper front'>
            <div className='face bg-cyan-400/20 border-2 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' />
          </div>
          
          {/* Back */}
          <div className='side-wrapper back'>
            <div className='face bg-cyan-400/20 border-2 border-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.5)]' />
          </div>

          {/* Right */}
          <div className='side-wrapper right'>
            <div className='face bg-pink-400/20 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' />
          </div>

          {/* Left */}
          <div className='side-wrapper left'>
            <div className='face bg-pink-400/20 border-2 border-pink-500 shadow-[0_0_15px_rgba(236,72,153,0.5)]' />
          </div>

          {/* Top */}
          <div className='side-wrapper top'>
            <div className='face bg-yellow-400/20 border-2 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]' />
          </div>

          {/* Bottom */}
          <div className='side-wrapper bottom'>
            <div className='face bg-yellow-400/20 border-2 border-yellow-500 shadow-[0_0_15px_rgba(250,204,21,0.5)]' />
          </div>
        </div>

        {/* Floor Shadow (Scales with the breathing) */}
        <div className='absolute -bottom-20 w-24 h-8 bg-purple-300/40 blur-xl rounded-[100%] animate-shadow-breathe' />
      </div>

      {/* Loading Text - More playful */}
      <div className='flex flex-col items-center gap-1 mt-2'>
        <h3 className='text-lg font-bold tracking-[0.2em] text-purple-600 uppercase drop-shadow-sm'>
          {message}
        </h3>
        <p className='text-sm text-purple-500 font-medium'>
          {subMessage}
        </p>
      </div>

      <style jsx>{`
        .perspective-container {
          perspective: 1200px;
        }

        .preserve-3d {
          transform-style: preserve-3d;
        }

        /* 1. Cube Spin 
          Rotates the entire assembly on X and Y axes 
        */
        @keyframes cubeSpin {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }

        /* 2. Face Breathing 
          Moves the face outward (translateZ) and back.
          Since the parent (.side-wrapper) is already rotated, Z is always "outward" relative to that face.
        */
        @keyframes breathe {
          0%, 100% { transform: translateZ(48px); opacity: 0.9; } /* 48px is half of w-24 (96px) */
          50% { transform: translateZ(80px); opacity: 0.6; border-color: rgba(255,255,255,0.9); }
        }

        @keyframes pulse-fast {
            0%, 100% { transform: scale(0.9); opacity: 0.7; }
            50% { transform: scale(1.3); opacity: 1; }
        }

        @keyframes shadow-breathe {
            0%, 100% { transform: scale(1); opacity: 0.5; }
            50% { transform: scale(1.6); opacity: 0.3; }
        }

        .animate-cube-spin {
          animation: cubeSpin 6s linear infinite;
        }

        .animate-pulse-fast {
            animation: pulse-fast 1.5s ease-in-out infinite;
        }

        .animate-shadow-breathe {
            animation: shadow-breathe 2.5s ease-in-out infinite;
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
          /* The 'breathe' animation is applied here */
          animation: breathe 2.5s ease-in-out infinite;
          backdrop-filter: blur(2px);
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
