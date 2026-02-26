import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { Info, Maximize2, Minimize2, RotateCcw, Home, Music, Smartphone } from "lucide-react";
import VoicesPanel from "../Voices/VoicesPanel";
import { useVoicesStore } from "../../store/useVoicesStore";

const World1: React.FC = () => {
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
  const clockRef = useRef(new THREE.Clock());

  // Raycasting and Dragging references
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
    const unsubscribe = useVoicesStore.subscribe((state) => {
      const { categories, isPlaying } = state;

      Object.entries(STEM_TO_MODEL).forEach(([category, modelName]) => {
        const action = actionsRef.current.get(modelName);
        if (!action) return;

        const cat = categories[category as keyof typeof categories];
        const shouldPerform = isPlaying && cat.activeVoice && !cat.muted;

        // Always keep animation playing — just change speed
        // Performing = full speed, idle = slow subtle movement
        action.timeScale = shouldPerform ? 1.0 : 0.2;

        // Ensure animation is always running
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
      cameraRef.current.position.set(13.19, 2.51, -1.94);
      cameraRef.current.rotation.set(-2.23, 1.33, 2.24);
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
    camera.position.set(13.19, 2.51, -1.94);
    camera.rotation.set(-2.23, 1.33, 2.24);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(50, 80, -100);
    scene.add(directionalLight);

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-5, 5, -5);
    scene.add(directionalLight2);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enableZoom = false;
    controls.enableRotate = false;
    controlsRef.current = controls;

    // Shared loader instance (reuses parser & cache)
    const sharedLoader = new GLTFLoader();

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
      rotationY: number = 0,
      rotationX: number = 0,
      rotationZ: number = 0
    ) => {
      sharedLoader.load(
        path,
        (gltf) => {
          const model = gltf.scene;
          model.scale.copy(scale);
          model.position.copy(position);
          model.rotation.set(rotationX, rotationY, rotationZ);
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
      sharedLoader.load(
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
            action.timeScale = 0.2; // idle speed — slow subtle movement
            action.play();

            console.log(`${name} animation ready (idle)`);
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
    sharedLoader.load(
      "/models/camping_buscraft_ambience.glb",
      (gltf) => {
        gltf.scene.scale.set(2, 2, 2);
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
    // Drummer - inside the tent, facing the fire
    loadAnimatedModel(
      "/models/Black_Student_Boy/Black_boy_drum.glb",
      "drummer",
      new THREE.Vector3(4.45, 0, -0.94),
      new THREE.Vector3(1, 1, 1),
      1.22 // face toward the fire
    );

    // Pianist - left side
    // Pianist - left side (custom loading for mesh rotation)
    {
      sharedLoader.load(
        "/models/Black_Student_Boy/pianist_black_boy.glb",
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(1, 1, 1);
          model.position.set(8.35, 0, -2.77);
          model.name = "pianist";

          setupModelMaterials(model);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.userData.clickable = true;
              child.userData.modelName = "pianist";
              // Apply rotation to mesh directly
              child.rotation.set(0, Math.PI, 0);
            }
          });

          scene.add(model);
          clickableModelsRef.current.set("pianist", model);

          // Setup animation if available
          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixersRef.current.push(mixer);

            const clip = gltf.animations[0];
            const action = mixer!.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            actionsRef.current.set("pianist", action);
            action.timeScale = 0.2; // idle speed
            action.play();
          }

          updateLoadingProgress();
          console.log("pianist loaded successfully");
        },
        (xhr) => { },
        (error) => {
          console.error("Error loading pianist:", error);
          updateLoadingProgress();
        }
      );
    }

    // Tambourinist - right side
    loadAnimatedModel(
      "/models/Black_Student_Boy/tambourinist.glb",
      "tambourinist",
      new THREE.Vector3(7.97, 0, 3.96),
      new THREE.Vector3(1, 1, 1),
      -Math.PI * 0.5
    );

    // Flutist - with flute instrument attached to hand bone
    {
      sharedLoader.load(
        "/models/nany-wheeler/source/djembe_flutist.glb",
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(1.4, 1.4, 1.4);
          model.position.set(9.24, 0, 1.95);
          model.rotation.y = Math.PI;
          model.name = "flutist";

          setupModelMaterials(model);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.userData.clickable = true;
              child.userData.modelName = "flutist";
            }
          });

          scene.add(model);
          clickableModelsRef.current.set("flutist", model);

          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixersRef.current.push(mixer);
            const clip = gltf.animations[0];
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            actionsRef.current.set("flutist", action);
            action.timeScale = 0.2;
            action.play();
          }

          updateLoadingProgress();
          console.log("flutist loaded successfully");

          // Find hand bone and attach flute instrument
          let handBone: THREE.Object3D | null = null;
          model.traverse((child) => {
            if ((child as any).isBone) {
              const n = child.name.toLowerCase();
              console.log("flutist bone:", child.name);
              if (!handBone && ((n.includes('right') && n.includes('hand')) ||
                  n.endsWith('hand_r') || n.endsWith('hand.r'))) {
                handBone = child;
              }
            }
          });

          if (handBone) {
            sharedLoader.load(
              "/models/Black_Student_Boy/flute.glb",
              (fluteGltf) => {
                const flute = fluteGltf.scene;
                flute.scale.set(0.004, 0.004, 0.004);
                flute.position.set(0, 0.05, 0.02);
                flute.rotation.set(-0.3, 0, Math.PI / 2);
                flute.name = "flute";
                setupModelMaterials(flute);
                flute.traverse((c) => {
                  if ((c as THREE.Mesh).isMesh) {
                    c.userData.clickable = true;
                    c.userData.modelName = "flutist";
                  }
                });
                (handBone as THREE.Object3D).add(flute);
                updateLoadingProgress();
                console.log("flute attached to bone:", (handBone as THREE.Object3D).name);
              },
              undefined,
              (error) => {
                console.error("Error loading flute:", error);
                updateLoadingProgress();
              }
            );
          } else {
            console.warn("No hand bone found for flutist");
            updateLoadingProgress();
          }
        },
        (xhr) => {},
        (error) => {
          console.error("Error loading flutist:", error);
          updateLoadingProgress();
          updateLoadingProgress();
        }
      );
    }

    // Guitarist - with guitar instrument attached to hand bone
    {
      sharedLoader.load(
        "/models/nany-wheeler/source/guitarist.glb",
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(1.4, 1.4, 1.4);
          model.position.set(3.2, 0, -4.99);
          model.rotation.y = Math.PI * 0.25;
          model.name = "guitarist";

          setupModelMaterials(model);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.userData.clickable = true;
              child.userData.modelName = "guitarist";
            }
          });

          scene.add(model);
          clickableModelsRef.current.set("guitarist", model);

          if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(model);
            mixersRef.current.push(mixer);
            const clip = gltf.animations[0];
            const action = mixer.clipAction(clip);
            action.setLoop(THREE.LoopRepeat, Infinity);
            action.clampWhenFinished = false;
            actionsRef.current.set("guitarist", action);
            action.timeScale = 0.2;
            action.play();
          }

          updateLoadingProgress();
          console.log("guitarist loaded successfully");

          // Find hand bone and attach guitar instrument
          let handBone: THREE.Object3D | null = null;
          model.traverse((child) => {
            if ((child as any).isBone) {
              const n = child.name.toLowerCase();
              console.log("guitarist bone:", child.name);
              if (!handBone && ((n.includes('right') && n.includes('hand')) ||
                  n.endsWith('hand_r') || n.endsWith('hand.r'))) {
                handBone = child;
              }
            }
          });

          if (handBone) {
            sharedLoader.load(
              "/models/Black_Student_Boy/low_poly_guitar.glb",
              (guitarGltf) => {
                const guitar = guitarGltf.scene;
                guitar.scale.set(0.6, 0.6, 0.6);
                guitar.position.set(0, -0.15, 0.1);
                guitar.rotation.set(0.3, 0, -Math.PI / 4);
                guitar.name = "guitar";
                setupModelMaterials(guitar);
                guitar.traverse((c) => {
                  if ((c as THREE.Mesh).isMesh) {
                    c.userData.clickable = true;
                    c.userData.modelName = "guitarist";
                  }
                });
                (handBone as THREE.Object3D).add(guitar);
                updateLoadingProgress();
                console.log("guitar attached to bone:", (handBone as THREE.Object3D).name);
              },
              undefined,
              (error) => {
                console.error("Error loading guitar:", error);
                updateLoadingProgress();
              }
            );
          } else {
            console.warn("No hand bone found for guitarist");
            updateLoadingProgress();
          }
        },
        (xhr) => {},
        (error) => {
          console.error("Error loading guitarist:", error);
          updateLoadingProgress();
          updateLoadingProgress();
        }
      );
    }

    // Load static instrument props around the campfire
    // Djembe drum - with drummer in tent
    loadStaticModel(
      "/models/Black_Student_Boy/djembe.glb",
      "djembe",
      new THREE.Vector3(4.45, 0, -0.94),
      new THREE.Vector3(2.7, 2.7, 2.7),
      1.22 // match drummer rotation
    );

    // Piano - side area
    // Piano - side area (inline for rotation control)
    {
      sharedLoader.load(
        "/models/Black_Student_Boy/piano.glb",
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(42, 42, 42);
          model.position.set(8.23, 0, -9.14);
          model.name = "piano";

          setupModelMaterials(model);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              child.userData.clickable = true;
              child.userData.modelName = "piano";
              // Apply rotation to mesh directly
              child.rotation.set(
                0,
                360 * (Math.PI / 180),
                201 * (Math.PI / 180)
              );
            }
          });

          scene.add(model);
          clickableModelsRef.current.set("piano", model);
          updateLoadingProgress();
          console.log("piano loaded successfully");
        },
        (xhr) => { },
        (error) => {
          console.error("Error loading piano:", error);
          updateLoadingProgress();
        }
      );
    }

    // Tambourine - near campfire
    // Tambourine - near campfire (inline for rotation control)
    {
      sharedLoader.load(
        "/models/Black_Student_Boy/tambourine.glb",
        (gltf) => {
          const model = gltf.scene;
          model.scale.set(50, 50, 50);
          model.position.set(7.8, 2.3, 13.8);
          model.name = "tambourine";

          setupModelMaterials(model);

          model.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const mesh = child as THREE.Mesh;
              mesh.userData.clickable = true;
              mesh.userData.modelName = "tambourine";

              // Center geometry to fix pivot
              if (mesh.geometry) {
                mesh.geometry.computeBoundingBox();
                if (mesh.geometry.boundingBox) {
                  const center = new THREE.Vector3();
                  mesh.geometry.boundingBox.getCenter(center);
                  mesh.geometry.translate(-center.x, -center.y, -center.z);
                }
              }

              // Apply rotation to mesh directly
              mesh.rotation.set(
                115 * (Math.PI / 180),
                213 * (Math.PI / 180),
                130 * (Math.PI / 180)
              );
            }
          });

          scene.add(model);
          clickableModelsRef.current.set("tambourine", model);
          updateLoadingProgress();
          console.log("tambourine loaded successfully");
        },
        (xhr) => { },
        (error) => {
          console.error("Error loading tambourine:", error);
          updateLoadingProgress();
        }
      );
    }

    // Mouse event handlers for interacting (Drag & Click)
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
          // Find which stem category maps to this model
          const stemCategory = Object.entries(STEM_TO_MODEL).find(
            ([, name]) => name === modelName
          )?.[0];

          // If voices are playing, toggle the stem's mute (keeps sync)
          if (stemCategory && useVoicesStore.getState().isPlaying) {
            useVoicesStore.getState().toggleMute(stemCategory);
          } else {
            // No stems playing — toggle between idle and full speed
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

    renderer.domElement.addEventListener("click", handleMouseClick);

    // Resize handler
    const handleResize = () => {
      renderer.setSize(window.innerWidth, window.innerHeight);
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    let rafId: number;

    // Animation loop
    const animate = () => {
      rafId = requestAnimationFrame(animate);

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
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      renderer.domElement.removeEventListener("click", handleMouseClick);
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
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

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
      )}

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
            className="relative"
          >
            <button
              onClick={() => setShowWorldPicker(!showWorldPicker)}
              className="px-3 sm:px-6 py-2 sm:py-3 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xl sm:text-2xl">🔥</span>
                <div className="text-left">
                  <h1 className="text-white font-bold text-sm sm:text-lg">Fireside World</h1>
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
                  <div
                    className="flex items-center gap-3 px-4 py-3 bg-white/10 cursor-default"
                  >
                    <span className="text-xl">🔥</span>
                    <div>
                      <p className="text-white font-semibold text-sm">Fireside World</p>
                      <p className="text-white/40 text-[10px]">Currently viewing</p>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/world2')}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors"
                  >
                    <span className="text-xl">🎭</span>
                    <div className="text-left">
                      <p className="text-white/80 font-semibold text-sm">Auditorium World</p>
                      <p className="text-white/40 text-[10px]">Switch world</p>
                    </div>
                  </button>
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

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Controls Hint */}
      {!showInfo && (
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
        worldId="world1"
      />


    </div>
  );
};

export default World1;

