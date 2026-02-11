"use client";

import React, { FC, useRef, useEffect, useState } from "react";

export interface CloudShaderProps {
  /** Animation speed multiplier */
  speed?: number;
  /** Number of FBM octaves */
  octaves?: number;
  /** Noise frequency scale */
  scale?: number;
  /** Canvas container CSS class */
  className?: string;
  /** Accessible label */
  ariaLabel?: string;
}

const vsSource = `
  attribute vec2 a_position;
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const fsSource = `
  precision highp float;

  uniform vec2 iResolution;
  uniform float iTime;
  uniform float u_speed;
  uniform float u_octaves;
  uniform float u_scale;

  // Hash & noise functions
  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p) * fract(p) * (3.0 - 2.0 * fract(p));
    float a = hash(i + vec2(0.0, 0.0));
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  // Fractal Brownian Motion
  float fbm(vec2 p) {
    float v = 0.0;
    float amp = 0.5;
    float freq = u_scale;
    for (int i = 0; i < 6; i++) {
      if (float(i) >= u_octaves) break;
      v += amp * noise(p * freq);
      freq *= 2.0;
      amp *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = (2.0 * gl_FragCoord.xy - iResolution) / iResolution.y;
    
    // Animate clouds moving across the sky
    vec2 cloudUV = uv * 0.8;
    cloudUV.x += iTime * u_speed * 0.15;
    cloudUV.y += iTime * u_speed * 0.05;

    // Create multiple cloud layers at different scales and speeds
    float cloud1 = fbm(cloudUV * 1.2);
    float cloud2 = fbm((cloudUV * 0.6) + vec2(iTime * u_speed * 0.1, 0.0));
    float cloud3 = fbm((cloudUV * 0.3) - vec2(iTime * u_speed * 0.08, 0.0));
    
    // Combine cloud layers
    float clouds = cloud1 * 0.5 + cloud2 * 0.3 + cloud3 * 0.2;
    clouds = smoothstep(0.3, 0.7, clouds);

    // Sky gradient - bright blue to lighter blue
    vec3 skyTop = vec3(0.4, 0.6, 0.9);      // Light blue
    vec3 skyBottom = vec3(0.6, 0.8, 1.0);   // Very light blue/white
    vec3 sky = mix(skyBottom, skyTop, uv.y * 0.5 + 0.5);

    // Cloud color - white with slight gray
    vec3 cloudColor = vec3(0.95, 0.95, 0.98);
    
    // Add depth to clouds with slight shadowing
    float cloudDepth = clouds * (1.0 - cloud1 * 0.3);
    vec3 cloudShaded = cloudColor * (0.9 + cloudDepth * 0.1);

    // Mix sky and clouds
    vec3 color = mix(sky, cloudShaded, clouds * 0.8);

    // Add subtle sun glow in the upper area
    vec2 sunPos = vec2(0.3, 0.6);
    float sunDist = length(uv - sunPos);
    vec3 sunGlow = vec3(1.0, 0.95, 0.85) * (0.15 / (sunDist + 0.3));
    color += sunGlow;

    // Soften the overall scene
    color = mix(color, sky, 0.1);

    gl_FragColor = vec4(color, 1.0);
  }
`;

const CloudShader: FC<CloudShaderProps> = ({
  speed = 1,
  octaves = 5,
  scale = 2,
  className = "",
  ariaLabel = "Animated cloud background",
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const frameId = useRef<number | undefined>(undefined);
  const startTime = useRef<number>(Date.now());

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      setError("WebGL not supported in this browser.");
      return;
    }

    // Shader compile helper
    const compileShader = (type: GLenum, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
        console.error(gl.getShaderInfoLog(sh));
        gl.deleteShader(sh);
        setError("Shader compile error – check console.");
        return null;
      }
      return sh;
    };

    // Compile VS and FS
    const vs = compileShader(gl.VERTEX_SHADER, vsSource);
    const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
    if (!vs || !fs) return;

    // Link program
    const program = gl.createProgram()!;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error(gl.getProgramInfoLog(program));
      setError("Program link error – check console.");
      return;
    }

    // Look up attribute & uniforms
    const posLoc = gl.getAttribLocation(program, "a_position");
    const resLoc = gl.getUniformLocation(program, "iResolution")!;
    const timeLoc = gl.getUniformLocation(program, "iTime")!;
    const speedLoc = gl.getUniformLocation(program, "u_speed")!;
    const octLoc = gl.getUniformLocation(program, "u_octaves")!;
    const scaleLoc = gl.getUniformLocation(program, "u_scale")!;

    // Full‐screen quad
    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, 1, 1, 1, -1, -1, 1, -1]),
      gl.STATIC_DRAW
    );

    // Resize handler
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    window.addEventListener("resize", resize);
    resize();

    // Render loop
    const render = () => {
      if (error) return;
      const now = (Date.now() - startTime.current) * 0.001;

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);

      gl.enableVertexAttribArray(posLoc);
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

      gl.uniform2f(resLoc, canvas.width, canvas.height);
      gl.uniform1f(timeLoc, now);
      gl.uniform1f(speedLoc, speed);
      gl.uniform1f(octLoc, octaves);
      gl.uniform1f(scaleLoc, scale);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      frameId.current = requestAnimationFrame(render);
    };
    frameId.current = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId.current!);
      window.removeEventListener("resize", resize);
    };
  }, [speed, octaves, scale, error]);

  return (
    <div
      role="region"
      aria-label={ariaLabel}
      className={`relative w-full h-full overflow-hidden ${className}`}
    >
      {error && (
        <div className="absolute inset-0 bg-black/80 flex items-center justify-center text-white font-mono p-4">
          {error}
        </div>
      )}
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default CloudShader;
