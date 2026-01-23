import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Info, Maximize2, Minimize2, RotateCcw, Home, Music } from "lucide-react";
import VoicesPanel from "../Voices/VoicesPanel";

const World1New: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVoicesPanel, setShowVoicesPanel] = useState(false);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const navigate = useNavigate();

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.set(-8, 1.5, -10);
      cameraRef.current.lookAt(5, 1.5, -15);
      controlsRef.current.reset();
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a1a); // Dark night sky

    // Create starfield
    const starGeometry = new THREE.BufferGeometry();
    const starCount = 2000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 500;
      starPositions[i + 1] = Math.random() * 200 + 20;
      starPositions[i + 2] = (Math.random() - 0.5) * 500;
    }
    starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.5,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);

    // Create moon
    const moonGeometry = new THREE.SphereGeometry(5, 32, 32);
    const moonMaterial = new THREE.MeshBasicMaterial({ color: 0xffffee });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.position.set(50, 80, -100);
    scene.add(moon);

    // Moon glow
    const moonGlowGeometry = new THREE.SphereGeometry(7, 32, 32);
    const moonGlowMaterial = new THREE.MeshBasicMaterial({
      color: 0xffffee,
      transparent: true,
      opacity: 0.15,
    });
    const moonGlow = new THREE.Mesh(moonGlowGeometry, moonGlowMaterial);
    moonGlow.position.copy(moon.position);
    scene.add(moonGlow);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.set(-8, 1.5, -10);
    camera.lookAt(5, 1.5, -15);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8; // Slightly darker for night

    // Lights - moonlit night atmosphere
    const ambientLight = new THREE.AmbientLight(0x1a1a2e, 0.4); // Dark blue ambient
    scene.add(ambientLight);

    // Moonlight - soft blue-white light from moon direction
    const moonLight = new THREE.DirectionalLight(0x8899bb, 0.6);
    moonLight.position.set(50, 80, -100);
    scene.add(moonLight);

    // Subtle fill light
    const fillLight = new THREE.DirectionalLight(0x2a2a4a, 0.2);
    fillLight.position.set(-5, 5, -5);
    scene.add(fillLight);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // Animation mixer for GLB animations
    let mixer: THREE.AnimationMixer | null = null;
    const clock = new THREE.Clock();

    // Load GLTF
    const forestLoader = new GLTFLoader();
    forestLoader.load(
      "/models/camping_buscraft_ambience.glb",
      (gltf) => {
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.set(0, 0, 1);
        gltf.scene.rotation.y = Math.PI / 4;

        gltf.scene.traverse((child) => {
          if ((child as THREE.Mesh).isMesh) {
            const mesh = child as THREE.Mesh;
            const materials = Array.isArray(mesh.material)
              ? mesh.material
              : [mesh.material];
            materials.forEach((material) => {
              if ((material as any).map) {
                ((material as any).map as THREE.Texture).colorSpace =
                  THREE.SRGBColorSpace;
              }
              material.needsUpdate = true;
            });
          }
        });

        scene.add(gltf.scene);

        // Play all animations if they exist
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(gltf.scene);
          gltf.animations.forEach((clip) => {
            const action = mixer!.clipAction(clip);
            action.play();
          });
        }

        setLoading(false);
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total) * 100;
        setLoadingProgress(progress);
      },
      (error) => {
        console.error("Error loading GLTF model:", error);
        setLoading(false);
      }
    );

    // Resize handler
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      if (mixer) mixer.update(delta);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-20 flex items-center justify-center bg-black"
          >
            <div className="text-center">
              <div className="text-6xl mb-6">🔥</div>
              <h2 className="text-3xl font-bold text-white mb-4">Fireside World</h2>
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-white/60 text-sm">Loading {Math.round(loadingProgress)}%</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 p-6">
        <div className="flex items-center justify-between">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-6 py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">🔥</span>
              <div>
                <h1 className="text-white font-bold text-lg">Fireside World</h1>
                <p className="text-white/60 text-xs">Interactive 3D Environment</p>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <button
              onClick={() => navigate('/home')}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
              title="Go to Home"
            >
              <Home size={20} style={{ color: '#E6B84D' }} />
            </button>
            <button
              onClick={() => setShowVoicesPanel(!showVoicesPanel)}
              className={`p-3 rounded-full backdrop-blur-md border transition-colors ${
                showVoicesPanel
                  ? "bg-purple-500/30 border-purple-400/50"
                  : "bg-black/40 border-white/10 hover:bg-black/60"
              }`}
              title="Voices Panel"
            >
              <Music size={20} className={showVoicesPanel ? "text-purple-300" : "text-white"} />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
            >
              <Info size={20} className="text-white" />
            </button>
            <button
              onClick={resetCamera}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
            >
              <RotateCcw size={20} className="text-white" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 size={20} className="text-white" />
              ) : (
                <Maximize2 size={20} className="text-white" />
              )}
            </button>
          </motion.div>
        </div>
      </div>

      {/* Info Panel */}
      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:max-w-md z-10"
          >
            <div className="p-6 rounded-2xl bg-black/60 backdrop-blur-md border border-white/10">
              <h3 className="text-xl font-bold text-white mb-3">About This World</h3>
              <p className="text-white/80 text-sm leading-relaxed mb-4">
                Gather around the campfire in this cozy forest environment. Perfect for storytelling,
                acoustic sessions, and intimate musical performances.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                  <span>Drag to rotate the camera</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                  <span>Scroll to zoom in/out</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                  <span>Right-click drag to pan</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls Hint */}
      {!showInfo && !showVoicesPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <p className="text-white/60 text-xs">
              Drag to explore • Scroll to zoom
            </p>
          </div>
        </motion.div>
      )}

      {/* Voices Panel */}
      <VoicesPanel
        isOpen={showVoicesPanel}
        onClose={() => setShowVoicesPanel(false)}
        worldId="world1"
      />
    </div>
  );
};

export default World1New;
