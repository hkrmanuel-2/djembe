import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Info, Maximize2, Minimize2, RotateCcw, Home, Music, Smartphone } from "lucide-react";
import VoicesPanel from "../Voices/VoicesPanel";

const World1: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVoicesPanel, setShowVoicesPanel] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const navigate = useNavigate();

  // Animation references
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const clockRef = useRef(new THREE.Clock());

  // Raycasting references
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const clickableModelsRef = useRef<Map<string, THREE.Object3D>>(new Map());

  // Check orientation for mobile devices
  useEffect(() => {
    const checkOrientation = () => {
      const portrait = window.innerHeight > window.innerWidth;
      const mobile = window.innerWidth < 1024;
      setIsPortrait(portrait);
      setIsMobile(mobile);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const resetCamera = () => {
    if (cameraRef.current && controlsRef.current) {
      // Updated camera position from World1New
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
    // Updated camera position from World1New
    camera.position.set(-8, 1.5, -10);
    camera.lookAt(5, 1.5, -15);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.8; // Slightly darker for night (from World1New)

    // Lights - moonlit night atmosphere (from World1New)
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

    // Track loading progress
    let modelsLoaded = 0;
    const totalModels = 11; // campfire + 5 musicians + 5 instruments

    const updateLoadingProgress = () => {
      modelsLoaded++;
      const progress = (modelsLoaded / totalModels) * 100;
      setLoadingProgress(progress);
      if (modelsLoaded >= totalModels) {
        setLoading(false);
      }
    };

    // Helper function to setup model materials
    const setupModelMaterials = (model: THREE.Object3D) => {
      model.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          const mesh = child as THREE.Mesh;
          const materials = Array.isArray(mesh.material)
            ? mesh.material
            : [mesh.material];
          materials.forEach((material: THREE.Material) => {
            if ((material as any).map) {
              ((material as any).map as THREE.Texture).colorSpace =
                THREE.SRGBColorSpace;
            }
            material.needsUpdate = true;
          });
        }
      });
    };

    // Helper function to load static model (instruments/props)
    const loadStaticModel = (
      path: string,
      name: string,
      position: THREE.Vector3,
      scale: THREE.Vector3,
      rotationY: number = 0
    ) => {
      const loader = new GLTFLoader();
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.copy(scale);
          model.position.copy(position);
          model.rotation.y = rotationY;
          model.name = name;

          setupModelMaterials(model);
          scene.add(model);

          updateLoadingProgress();
          console.log(`${name} loaded successfully`);
        },
        (xhr) => {
          console.log(`${name} loading: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error) => {
          console.error(`Error loading ${name}:`, error);
          updateLoadingProgress();
        }
      );
    };

    // Helper function to load animated model
    const loadAnimatedModel = (
      path: string,
      name: string,
      position: THREE.Vector3,
      scale: THREE.Vector3,
      rotationY: number = 0
    ) => {
      const loader = new GLTFLoader();
      loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.copy(scale);
          model.position.copy(position);
          model.rotation.y = rotationY;
          model.name = name;

          setupModelMaterials(model);

          // Mark as clickable
          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.userData.clickable = true;
              child.userData.modelName = name;
            }
          });

          scene.add(model);
          clickableModelsRef.current.set(name, model);

          // Setup animation if available
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixersRef.current.push(mixer);

            const clip = gltf.animations[0];
            const action = mixer!.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            actionsRef.current.set(name, action);
            action.play();

            console.log(`${name} animation ready - click to play!`);
          }

          updateLoadingProgress();
          console.log(`${name} loaded successfully`);
        },
        (xhr) => {
          console.log(`${name} loading: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error) => {
          console.error(`Error loading ${name}:`, error);
          updateLoadingProgress();
        }
      );
    };

    // Load campfire environment
    const forestLoader = new GLTFLoader();
    forestLoader.load(
      "/models/camping_buscraft_ambience.glb",
      (gltf) => {
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.set(0, 0, 1);
        gltf.scene.rotation.y = Math.PI / 4;

        setupModelMaterials(gltf.scene);
        scene.add(gltf.scene);

        // Play campfire animations if they exist (from World1New)
        if (gltf.animations && gltf.animations.length > 0) {
          const campfireMixer = new THREE.AnimationMixer(gltf.scene);
          mixersRef.current.push(campfireMixer);
          gltf.animations.forEach((clip) => {
            const action = campfireMixer.clipAction(clip);
            action.play();
          });
        }

        updateLoadingProgress();
      },
      (xhr) => {
        const progress = (xhr.loaded / xhr.total) * 100;
        console.log(`Campfire loading: ${progress}%`);
      },
      (error) => {
        console.error("Error loading campfire:", error);
        updateLoadingProgress();
      }
    );

    // Load all musician models arranged around the campfire
    // Drummer - near the fire
    loadAnimatedModel(
      "/models/Black_Student_Boy/Black_boy_drum.glb",
      "drummer",
      new THREE.Vector3(22, 1, 8),
      new THREE.Vector3(3, 3, 3),
      -Math.PI * 0.75
    );

    // Pianist - left side
    loadAnimatedModel(
      "/models/Black_Student_Boy/pianist_black_boy.glb",
      "pianist",
      new THREE.Vector3(16, 1, 18),
      new THREE.Vector3(3, 3, 3),
      Math.PI * 0.5
    );

    // Tambourinist - right side
    loadAnimatedModel(
      "/models/Black_Student_Boy/tambourinist.glb",
      "tambourinist",
      new THREE.Vector3(25, 1, 12),
      new THREE.Vector3(3, 3, 3),
      -Math.PI * 0.5
    );

    loadAnimatedModel(
      "/models/nany-wheeler/source/djembe_flutist.glb",
      "flutist",
      new THREE.Vector3(17, 1, -10),
      new THREE.Vector3(3, 3, 3),
      Math.PI
    );

    loadAnimatedModel(
      "/models/nany-wheeler/source/guitarist.glb",
      "guitarist",
      new THREE.Vector3(14, 1, 18),
      new THREE.Vector3(3, 3, 3),
      Math.PI * 0.25
    );

    // Load static instrument props around the campfire
    // Djembe drum - near fire
    loadStaticModel(
      "/models/Black_Student_Boy/djembe.glb",
      "djembe",
      new THREE.Vector3(22, 1, 8),
      new THREE.Vector3(10, 10, 10),
      Math.PI
    );

    // Piano - side area
    loadStaticModel(
      "/models/Black_Student_Boy/piano.glb",
      "piano",
      new THREE.Vector3(16, 1, 18),
      new THREE.Vector3(100, 100, 100),
      Math.PI * 0.5
    );

    // Tambourine - near campfire
    loadStaticModel(
      "/models/Black_Student_Boy/tambourine.glb",
      "tambourine",
      new THREE.Vector3(25, 1, 12),
      new THREE.Vector3(100, 100, 100),
      -Math.PI * 0.5
    );

    // Flute - back left
    loadStaticModel(
      "/models/Black_Student_Boy/flute.glb",
      "flute",
      new THREE.Vector3(17, 1, -10),
      new THREE.Vector3(0.05, 0.05, 0.05),
      Math.PI * 0.25
    );

    // Guitar - back right
    loadStaticModel(
      "/models/Black_Student_Boy/low_poly_guitar.glb",
      "guitar",
      new THREE.Vector3(14, 1, 18),
      new THREE.Vector3(6, 6, 6),
      -Math.PI * 0.25
    );

    // Click handler for playing animations
    const handleClick = (event: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, camera);

      // Check intersections with all clickable models
      clickableModelsRef.current.forEach((model, name) => {
        const intersects = raycasterRef.current.intersectObject(model, true);

        if (intersects.length > 0) {
          console.log(`${name} clicked!`);

          const action = actionsRef.current.get(name);
          if (action) {
            if (action.isRunning()) {
              action.fadeOut(0.3);
              console.log(`${name} animation stopped`);
            } else {
              action.reset().fadeIn(0.3).play();
              console.log(`${name} animation playing`);
            }
          }
        }
      });
    };

    renderer.domElement.addEventListener("click", handleClick);

    // Resize handler
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Log camera position on 'C' key press
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'c' || event.key === 'C') {
        console.log('Camera Position:', {
          x: camera.position.x.toFixed(2),
          y: camera.position.y.toFixed(2),
          z: camera.position.z.toFixed(2)
        });
      }
    };
    window.addEventListener("keydown", handleKeyPress);

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate);

      // Update all animation mixers
      const delta = clockRef.current.getDelta();
      mixersRef.current.forEach((mixer) => {
        mixer.update(delta);
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyPress);
      renderer.domElement.removeEventListener("click", handleClick);
      mixersRef.current.forEach((mixer) => {
        mixer.stopAllAction();
      });
      renderer.dispose();
      scene.clear();
    };
  }, []);

  // Show portrait mode overlay on mobile
  if (isMobile && isPortrait) {
    return (
      <div className="fixed inset-0 z-[100] bg-[#1A2B4A] flex flex-col items-center justify-center p-8">
        <style>{`
          @keyframes pulse-rotate {
            0%, 100% { transform: rotate(-15deg) scale(1); }
            50% { transform: rotate(15deg) scale(1.05); }
          }
        `}</style>
        <div className="text-center max-w-sm">
          {/* Rotating phone icon */}
          <div className="mb-6 relative">
            <Smartphone
              size={80}
              className="text-[#E6B84D] mx-auto"
              style={{ animation: 'pulse-rotate 2s ease-in-out infinite' }}
            />
            <RotateCcw
              size={32}
              className="text-[#4A9B9B] absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2"
            />
          </div>

          <h2 className="text-2xl font-bold text-white mb-3">
            Rotate Your Device
          </h2>

          <p className="text-white/70 mb-6">
            Fireside World works best in <span className="text-[#E6B84D] font-semibold">landscape mode</span>.
            Please rotate your device horizontally to continue.
          </p>

          <div className="flex items-center justify-center gap-2 text-white/50 text-sm">
            <div className="w-12 h-8 border-2 border-white/30 rounded-md flex items-center justify-center">
              <div className="w-8 h-4 bg-white/20 rounded-sm"></div>
            </div>
            <span>→</span>
            <div className="w-16 h-10 border-2 border-[#E6B84D] rounded-md flex items-center justify-center">
              <div className="w-10 h-6 bg-[#E6B84D]/20 rounded-sm"></div>
            </div>
          </div>

          <button
            onClick={() => navigate('/home')}
            className="mt-8 px-6 py-2 bg-white/10 border border-white/20 rounded-full text-white text-sm hover:bg-white/20 transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    );
  }

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
      <div className="absolute top-0 left-0 right-0 z-10 p-3 sm:p-6">
        <div className="flex items-center justify-between">
          {/* Title */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="px-3 sm:px-6 py-2 sm:py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10"
          >
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-xl sm:text-2xl">🔥</span>
              <div>
                <h1 className="text-white font-bold text-sm sm:text-lg">Fireside World</h1>
                <p className="text-white/60 text-[10px] sm:text-xs hidden sm:block">Interactive 3D Environment</p>
              </div>
            </div>
          </motion.div>

          {/* Controls */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 sm:gap-2"
          >
            <button
              onClick={() => navigate('/home')}
              className="p-2 sm:p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
              title="Go to Home"
            >
              <Home size={16} className="sm:w-5 sm:h-5" style={{ color: '#E6B84D' }} />
            </button>
            <button
              onClick={() => setShowVoicesPanel(!showVoicesPanel)}
              className={`p-2 sm:p-3 rounded-full backdrop-blur-md border transition-colors ${
                showVoicesPanel
                  ? "bg-purple-500/30 border-purple-400/50"
                  : "bg-black/40 border-white/10 hover:bg-black/60"
              }`}
              title="Voices Panel"
            >
              <Music size={16} className={`sm:w-5 sm:h-5 ${showVoicesPanel ? "text-purple-300" : "text-white"}`} />
            </button>
            <button
              onClick={() => setShowInfo(!showInfo)}
              className="p-2 sm:p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
            >
              <Info size={16} className="sm:w-5 sm:h-5 text-white" />
            </button>
            <button
              onClick={resetCamera}
              className="p-2 sm:p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
            >
              <RotateCcw size={16} className="sm:w-5 sm:h-5 text-white" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="hidden sm:block p-2 sm:p-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 transition-colors"
            >
              {isFullscreen ? (
                <Minimize2 size={16} className="sm:w-5 sm:h-5 text-white" />
              ) : (
                <Maximize2 size={16} className="sm:w-5 sm:h-5 text-white" />
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
                Gather around the campfire with a full band! Click on any musician to start/stop their animation.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                  <span>Click musicians to toggle animation</span>
                </div>
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

      {/* Bottom Controls Hint - Updated condition from World1New */}
      {!showInfo && !showVoicesPanel && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10"
        >
          <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
            <p className="text-white/60 text-xs">
              Click musicians to animate • Drag to explore • Scroll to zoom
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

export default World1;
