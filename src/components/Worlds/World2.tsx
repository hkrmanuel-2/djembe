import { logger } from "@/lib/logger";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { Timer } from "three";
// @ts-ignore - Module resolution issue with three addons in this project setup
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
// @ts-ignore
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { Info, Maximize2, Minimize2, RotateCcw, Home, Music, Smartphone, X } from "lucide-react";
import VoicesPanel from "../Voices/VoicesPanel";
import { useVoicesStore } from "../../store/useVoicesStore";

const World2: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVoicesPanel, setShowVoicesPanel] = useState(false);
  const [showWorldPicker, setShowWorldPicker] = useState(false);
  const [isPortrait, setIsPortrait] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const navigate = useNavigate();

  // Animation references
  const mixersRef = useRef<THREE.AnimationMixer[]>([]);
  const actionsRef = useRef<Map<string, THREE.AnimationAction>>(new Map());
  const timerRef = useRef(new Timer());

  // Raycasting & Interaction references
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const clickableModelsRef = useRef<Map<string, THREE.Object3D>>(new Map());



  // Map stem categories to 3D model names
  const STEM_TO_MODEL: Record<string, string> = {
    rhythm: "drummer",
    bass: "guitarist",
    harmony: "pianist",
    melody: "flutist",
    extras: "tambourinist",
  };

  // Sync stem playback ↔ 3D model animations
  useEffect(() => {
    const unsubscribe = useVoicesStore.subscribe((state: any) => {
      const { categories, isPlaying } = state;

      Object.entries(STEM_TO_MODEL).forEach(([category, modelName]) => {
        const action = actionsRef.current.get(modelName);
        if (!action) return;

        const cat = categories[category as keyof typeof categories];
        const shouldPerform = isPlaying && cat.activeVoice && !cat.muted;

        action.timeScale = shouldPerform ? 1.0 : 0.2;

        if (!action.isRunning()) {
          action.reset().play();
          action.timeScale = shouldPerform ? 1.0 : 0.2;
        }
      });
    });
    return () => unsubscribe();
  }, []);

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
      cameraRef.current.position.set(172.08, 53.4, 159.28);
      cameraRef.current.rotation.set(-2.95, -0.68, -3.02);
      const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(-2.95, -0.68, -3.02, 'XYZ'));
      controlsRef.current.target.copy(cameraRef.current.position).add(forward.multiplyScalar(100));
      controlsRef.current.update();
      // controlsRef.current.reset(); // Don't reset to 0,0,0 if default initialization was bad
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
    scene.background = new THREE.Color(0x1a1a1a);

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    // Initial camera position
    camera.position.set(172.08, 53.4, 159.28);
    camera.rotation.set(-2.95, -0.68, -3.02);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.maxPolarAngle = Math.PI / 2 - 0.1;
    const forward = new THREE.Vector3(0, 0, -1).applyEuler(new THREE.Euler(-2.95, -0.68, -3.02, 'XYZ'));
    controls.target.copy(camera.position).add(forward.multiplyScalar(100));
    controls.update();
    controlsRef.current = controls;

    // Track loading progress
    let modelsLoaded = 0;
    const totalModels = 9; // auditorium + 3 musicians + 5 instruments

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
            material.side = THREE.DoubleSide; // Fix for background leak
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
      rotation: number | THREE.Euler = 0
    ) => {
      const loader = new GLTFLoader();
      loader.load(
        path,
        (gltf: any) => {
          const model = gltf.scene;
          model.scale.copy(scale);
          model.position.copy(position);
          model.rotation.order = 'YXZ';
          if (typeof rotation === 'number') {
            model.rotation.y = rotation;
          } else {
            model.rotation.copy(rotation);
          }
          model.name = name;

          setupModelMaterials(model);

          // Mark as clickable
          model.traverse((child: any) => {
            if ((child as THREE.Mesh).isMesh) {
              child.userData.clickable = true;
              child.userData.modelName = name;
            }
          });

          scene.add(model);
          clickableModelsRef.current.set(name, model);

          updateLoadingProgress();
          logger.log(`${name} loaded successfully`);
        },
        (xhr: any) => {
          console.log(`${name} loading: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error: any) => {
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
      rotation: number | THREE.Euler = 0
    ) => {
      const loader = new GLTFLoader();
      loader.load(
        path,
        (gltf: any) => {
          const model = gltf.scene;
          model.scale.copy(scale);
          model.position.copy(position);
          model.rotation.order = 'YXZ';
          if (typeof rotation === 'number') {
            model.rotation.y = rotation;
          } else {
            model.rotation.copy(rotation);
          }
          model.name = name;

          setupModelMaterials(model);

          model.traverse((child: any) => {
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
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            actionsRef.current.set(name, action);
            action.timeScale = 0.2; // Start with idle speed
            action.play();

            console.log(`${name} animation auto-playing!`);
          }

          updateLoadingProgress();
          logger.log(`${name} loaded successfully`);
        },
        (xhr: any) => {
          console.log(`${name} loading: ${(xhr.loaded / xhr.total) * 100}%`);
        },
        (error: any) => {
          console.error(`Error loading ${name}:`, error);
          updateLoadingProgress();
        }
      );
    };

    // Load main auditorium model
    const audiLoader = new GLTFLoader();
    audiLoader.load(
      "src/components/3D_World_2/theater_cinema_auditorium_style_2_of_2/scene.gltf",
      (gltf: any) => {
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.set(0, -2, 1);
        gltf.scene.rotation.y = Math.PI / 4;
        setupModelMaterials(gltf.scene);
        scene.add(gltf.scene);
        updateLoadingProgress();
      },
      (xhr: any) => {
        const progress = (xhr.loaded / xhr.total) * 100;
        logger.log(`Auditorium loading: ${progress}%`);
      },
      (error: any) => {
        console.error("Error loading auditorium:", error);
        updateLoadingProgress();
      }
    );

    // Load all musician models with different positions
    // Drummer - center stage
    loadAnimatedModel(
      "/models/Black_Student_Boy/Black_boy_drum.glb",
      "drummer",
      new THREE.Vector3(225.51, 20, 357.22),
      new THREE.Vector3(25, 25, 25),
      3.91
    );

    // Pianist - left side
    loadAnimatedModel(
      "/models/Black_Student_Boy/pianist_black_boy.glb",
      "pianist",
      new THREE.Vector3(336.85, 20, 235.47),
      new THREE.Vector3(25, 25, 25),
      4.01
    );

    // Tambourinist - right side
    loadAnimatedModel(
      "/models/Black_Student_Boy/tambourinist.glb",
      "tambourinist",
      new THREE.Vector3(280.83, 20, 294.12),
      new THREE.Vector3(25, 25, 25),
      -2.36
    );

    loadAnimatedModel(
      "/models/nany-wheeler/source/guitarist.glb",
      "guitarist",
      new THREE.Vector3(401.19, 20, 178.25),
      new THREE.Vector3(45, 45, 45),
      4.01
    );

    loadAnimatedModel(
      "/models/nany-wheeler/source/djembe_flutist.glb",
      "flutist",
      new THREE.Vector3(183.19, 20, 405.56),
      new THREE.Vector3(45, 45, 45),
      3.54
    );



    // Load static instrument props
    // Djembe drum - front left
    loadStaticModel(
      "/models/Black_Student_Boy/djembe.glb",
      "djembe",
      new THREE.Vector3(227.39, 20, 357.73),
      new THREE.Vector3(60, 60, 60),
      0.79
    );

    // Piano - far left
    loadStaticModel(
      "/models/Black_Student_Boy/piano.glb",
      "piano",
      new THREE.Vector3(228.72, 20.00, 127.46),
      new THREE.Vector3(970, 970, 970),
      0.80
    );

    // Tambourine - front right
    loadStaticModel(
      "/models/Black_Student_Boy/tambourine.glb",
      "tambourine",
      new THREE.Vector3(283.14, 74, 294.57),
      new THREE.Vector3(650, 650, 650),
      new THREE.Euler(0.00, 0.52, 1.71, 'YXZ')
    );

    // Flute - back left
    loadStaticModel(
      "/models/Black_Student_Boy/flute (1).glb",
      "flute",
      new THREE.Vector3(167.08, 80.00, 394.11),
      new THREE.Vector3(0.6, 0.6, 0.6),
      new THREE.Euler(6.28, 2.37, 5.71, 'YXZ')
    );

    // Guitar - back right
    loadStaticModel(
      "/models/Black_Student_Boy/low_poly_guitar.glb",
      "guitar",
      new THREE.Vector3(428.69, 107.00, 139.83),
      new THREE.Vector3(30, 30, 30),
      0.58
    );

    // Mouse event handlers for interacting (Click only)
    const handleMouseClick = (event: MouseEvent) => {
      event.preventDefault();

      const rect = renderer.domElement.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
      );

      raycasterRef.current.setFromCamera(mouse, camera);
      const intersects = raycasterRef.current.intersectObjects(
        Array.from(clickableModelsRef.current.values()),
        true
      );

      if (intersects.length > 0) {
        let target: THREE.Object3D | null = intersects[0].object;
        let modelName: string | null = null;

        while (target) {
          if (target.userData.modelName && clickableModelsRef.current.has(target.userData.modelName)) {
            modelName = target.userData.modelName;
            break;
          }
          target = target.parent;
        }

        if (modelName) {
          const stemCategory = Object.entries(STEM_TO_MODEL).find(
            ([, name]) => name === modelName
          )?.[0];

          if (stemCategory && useVoicesStore.getState().isPlaying) {
            useVoicesStore.getState().toggleMute(stemCategory);
          } else {
            const action = actionsRef.current.get(modelName);
            if (action) {
              action.timeScale = action.timeScale < 0.5 ? 1.0 : 0.2;
              if (!action.isRunning()) {
                action.reset().play();
                action.timeScale = 1.0;
              }
            }
          }
        }
      }
    };

    // Keydown handler for logging positions
    const handleKeyDown = (event: KeyboardEvent) => {
      // Log camera position
      if (event.key === 'c' || event.key === 'C') {
        const pos = camera.position;
        const rot = camera.rotation;
        console.log('Camera Position:', {
          x: Number(pos.x.toFixed(2)),
          y: Number(pos.y.toFixed(2)),
          z: Number(pos.z.toFixed(2))
        });
        console.log('Camera Rotation:', {
          x: Number(rot.x.toFixed(2)),
          y: Number(rot.y.toFixed(2)),
          z: Number(rot.z.toFixed(2))
        });
      }

      // Log model positions
      if (event.key === 'm' || event.key === 'M') {
        console.log('--- Model Positions ---');
        clickableModelsRef.current.forEach((model, name) => {
          const pos = model.position;
          const rot = model.rotation;
          console.log(`${name}:`);
          console.log(`  Position: x=${pos.x.toFixed(2)}, y=${pos.y.toFixed(2)}, z=${pos.z.toFixed(2)}`);
          console.log(`  Rotation: x=${rot.x.toFixed(2)}, y=${rot.y.toFixed(2)}, z=${rot.z.toFixed(2)}`);
        });
        console.log('-----------------------');
      }
    };

    const canvasEl = renderer.domElement;
    canvasEl.addEventListener("click", handleMouseClick as EventListener);
    window.addEventListener("keydown", handleKeyDown);

    // Resize handler
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);

      // Update all animation mixers
      const delta = timerRef.current.update().getDelta();
      mixersRef.current.forEach((mixer) => {
        mixer.update(delta);
      });

      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", handleResize);
      canvasEl.removeEventListener("click", handleMouseClick as EventListener);
      window.removeEventListener("keydown", handleKeyDown);

      mixersRef.current.forEach((mixer) => {
        mixer.stopAllAction();
      });
      renderer.dispose();
      scene.clear();
    };
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      {/* 3D Canvas — always in DOM so Three.js context survives orientation changes */}

      {/* Portrait mode overlay (on top of canvas, not replacing it) */}
      {isMobile && isPortrait && (
        <div className="absolute inset-0 z-[100] bg-[#1A2B4A] flex flex-col items-center justify-center p-8">
          <style>{`
            @keyframes pulse-rotate {
              0%, 100% { transform: rotate(-15deg) scale(1); }
              50% { transform: rotate(15deg) scale(1.05); }
            }
          `}</style>
          <div className="text-center max-w-sm">
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
              Auditorium World works best in <span className="text-[#E6B84D] font-semibold">landscape mode</span>.
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
      )}

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
              <div className="text-6xl mb-6">🎭</div>
              <h2 className="text-3xl font-bold text-white mb-4">Auditorium World</h2>
              <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mb-2">
                <motion.div
                  className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
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
            className="relative"
          >
            <button
              onClick={() => setShowWorldPicker(!showWorldPicker)}
              className="px-3 sm:px-6 py-2 sm:py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">🎭</span>
                <div className="text-left">
                  <h1 className="text-white font-bold text-sm sm:text-lg">Auditorium World</h1>
                  <p className="text-white/60 text-[10px] sm:text-xs hidden sm:block">Interactive 3D Environment</p>
                </div>
                <svg
                  className={`w-4 h-4 text-white/60 transition-transform ${showWorldPicker ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {/* World Picker Dropdown */}
            <AnimatePresence>
              {showWorldPicker && (
                <motion.div
                  initial={{ opacity: 0, y: -8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-56 rounded-xl bg-black/70 backdrop-blur-md border border-white/10 overflow-hidden shadow-2xl"
                >
                  <button
                    onClick={() => navigate('/world1')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-xl">🔥</span>
                    <div className="text-left">
                      <p className="text-white/80 font-semibold text-sm">Fireside World</p>
                      <p className="text-white/40 text-[10px]">Switch world</p>
                    </div>
                  </button>
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-white/10 cursor-default"
                  >
                    <span className="text-xl">🎭</span>
                    <div>
                      <p className="text-white font-semibold text-sm">Auditorium World</p>
                      <p className="text-white/40 text-[10px]">Currently viewing</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
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
              className={`p-2 sm:p-3 rounded-full backdrop-blur-md border transition-colors ${showVoicesPanel
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
                Step into a grand auditorium with a full band! Click on any musician to start/stop their animation.
              </p>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                  <span>Click musicians to toggle animation</span>
                </div>
                <div className="flex items-center gap-2 text-white/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-white/60"></span>
                  <span>Drag background to explore</span>
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
              Click musicians to animate
            </p>
          </div>
        </motion.div>
      )}




      {/* Voices Panel */}
      <VoicesPanel
        isOpen={showVoicesPanel}
        onClose={() => setShowVoicesPanel(false)}
        worldId="world2"
      />
    </div>
  );
};

export default World2;
