import { logger } from "@/lib/logger";
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export default function World2() {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Animation references - separate for each character
  const drummerMixerRef = useRef(null);
  const drummerActionRef = useRef(null);
  const pianistMixerRef = useRef(null);
  const pianistActionRef = useRef(null);
  const timerRef = useRef(new THREE.Timer());

  // Raycasting references
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());
  const drummerModelRef = useRef(null);
  const cameraRef = useRef(null);
  const pianistModelRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87CEEB);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(0, 8, 30);
    camera.lookAt(0, 2, -5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    mountRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

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
    controlsRef.current = controls;

    // Load auditorium model
    const loader = new GLTFLoader();
    loader.load(
      "/models/auditorium_cinema/scene.gltf",
      (gltf) => {
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.set(0, -1, 0);
        gltf.scene.rotation.y = Math.PI;

        gltf.scene.traverse((child) => {
          if (child.isMesh) {
            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((material) => {
                if (material.map) {
                  material.map.colorSpace = THREE.SRGBColorSpace;
                }
                material.needsUpdate = true;
              });
            }
          }
        });

        scene.add(gltf.scene);
      },
      (xhr) => {
        logger.log('Auditorium Loading: ' + (xhr.loaded / xhr.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading auditorium model:', error);
      }
    );

    // Load drummer model with animation
    const loader2 = new GLTFLoader();
    loader2.load(
      '/src/components/3D_World_1/Black_Student_Boy/Black_boy_drum.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(4, 4, 4);
        model.position.set(6, 5, -95);
        model.rotation.y = 0;

        // Store reference for raycasting
        drummerModelRef.current = model;

        model.traverse((child) => {
          if (child.isMesh) {
            logger.log('Mesh found:', child.name, child.material);
            // Enable raycasting on meshes
            child.userData.clickable = true;

            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((material) => {
                if (material.map) {
                  material.map.colorSpace = THREE.SRGBColorSpace;
                }
                material.needsUpdate = true;
              });
            }
          }
        });

        scene.add(model);

        // Setup animation mixer for drummer
        if (gltf.animations && gltf.animations.length > 0) {
          logger.log('Drummer animations found:', gltf.animations.map(a => a.name));

          const mixer = new THREE.AnimationMixer(model);
          drummerMixerRef.current = mixer;

          // Get the first animation clip
          const clip = gltf.animations[0];
          const action = mixer.clipAction(clip);

          // Configure the action
          action.setLoop(THREE.LoopRepeat);
          action.clampWhenFinished = false;
          drummerActionRef.current = action;

          logger.log('Drummer animation ready - click on the drummer to play!');
        } else {
          logger.log('No animations found in the drummer model');
        }
      },
      (xhr) => {
        logger.log('Drummer Loading: ' + (xhr.loaded / xhr.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading drummer model:', error);
      }
    );

    // Click handler for playing animation
    const handleClick = (event) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Check for intersections with the drummer model
      if (drummerModelRef.current) {
        const intersects = raycasterRef.current.intersectObject(drummerModelRef.current, true);

        if (intersects.length > 0) {
          logger.log('Drummer clicked!');

          // Toggle animation playback
          if (drummerActionRef.current) {
            if (drummerActionRef.current.isRunning()) {
              // Stop the animation
              drummerActionRef.current.fadeOut(0.3);
              logger.log('Drummer animation stopped');
            } else {
              // Play the animation
              drummerActionRef.current.reset().fadeIn(0.3).play();
              logger.log('Drummer animation playing');
            }
          }
        }
      }
    };

    // Load pianist model with animation
    const loader3 = new GLTFLoader();
    loader3.load(
      '/src/components/3D_World_1/Black_Student_Boy/pianist_black_boy.glb',
      (gltf) => {
        const model = gltf.scene;
        model.scale.set(4, 4, 4);
        model.position.set(12, 5, -95);
        model.rotation.y = 0;

        // Store reference for raycasting
        pianistModelRef.current = model;

        model.traverse((child) => {
          if (child.isMesh) {
            logger.log('Mesh found:', child.name, child.material);
            // Enable raycasting on meshes
            child.userData.clickable = true;

            if (child.material) {
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach((material) => {
                if (material.map) {
                  material.map.colorSpace = THREE.SRGBColorSpace;
                }
                material.needsUpdate = true;
              });
            }
          }
        });

        scene.add(model);

        // Setup animation mixer for pianist
        if (gltf.animations && gltf.animations.length > 0) {
          logger.log('Pianist animations found:', gltf.animations.map(a => a.name));

          const mixer = new THREE.AnimationMixer(model);
          pianistMixerRef.current = mixer;

          // Get the first animation clip
          const clip = gltf.animations[0];
          const action = mixer.clipAction(clip);

          // Configure the action
          action.setLoop(THREE.LoopRepeat);
          action.clampWhenFinished = false;
          pianistActionRef.current = action;

          logger.log('Pianist animation ready - click on the pianist to play!');
        } else {
          logger.log('No animations found in the pianist model');
        }
      },
      (xhr) => {
        logger.log('Pianist Loading: ' + (xhr.loaded / xhr.total * 100) + '%');
      },
      (error) => {
        console.error('Error loading pianist model:', error);
      }
    );

    // Click handler for playing animation
    const handleClickPianist = (event) => {
      // Calculate mouse position in normalized device coordinates
      const rect = renderer.domElement.getBoundingClientRect();
      mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

      // Update raycaster
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);

      // Check for intersections with the pianist model
      if (pianistModelRef.current) {
        const intersects = raycasterRef.current.intersectObject(pianistModelRef.current, true);

        if (intersects.length > 0) {
          logger.log('Pianist clicked!');

          // Toggle animation playback
          if (pianistActionRef.current) {
            if (pianistActionRef.current.isRunning()) {
              // Stop the animation
              pianistActionRef.current.fadeOut(0.3);
              logger.log('Pianist animation stopped');
            } else {
              // Play the animation
              pianistActionRef.current.reset().fadeIn(0.3).play();
              logger.log('Pianist animation playing');
            }
          }
        }
      }
    };


    // Add click event listener
    renderer.domElement.addEventListener('click', handleClick);
    renderer.domElement.addEventListener('click', handleClickPianist);

    // Animation loop
    function animate() {
      animationFrameRef.current = requestAnimationFrame(animate);

      // Update animation mixers for both characters
      timerRef.current.update();
      const delta = timerRef.current.getDelta();
      if (drummerMixerRef.current) {
        drummerMixerRef.current.update(delta);
      }
      if (pianistMixerRef.current) {
        pianistMixerRef.current.update(delta);
      }

      const canvas = renderer.domElement;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const needResize = canvas.width !== width || canvas.height !== height;
      if (needResize) {
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      controls.update();
      renderer.render(scene, camera);
    }
    animate();

    // Handle resize
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      renderer.domElement.removeEventListener('click', handleClick);
      renderer.domElement.removeEventListener('click', handleClickPianist);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (drummerMixerRef.current) {
        drummerMixerRef.current.stopAllAction();
      }
      if (pianistMixerRef.current) {
        pianistMixerRef.current.stopAllAction();
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (mountRef.current && rendererRef.current.domElement) {
          mountRef.current.removeChild(rendererRef.current.domElement);
        }
      }
    };
  }, []);

  return <div ref={mountRef} style={{ width: '100vw', height: '100vh' }} />;
}