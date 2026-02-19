import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';

const canvas = document.querySelector('#world_1');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); 
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(-8, 1.5, -10);
camera.lookAt(5, 1.5, -15);
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.0;

const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight2.position.set(-5, 5, -5);
scene.add(directionalLight2);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.enableZoom = true;

const loader1 = new GLTFLoader();

loader1.load(
    './low_poly_forest_campfire_updated/scene.gltf',
    function (gltf) {
        gltf.scene.scale.set(1, 1, 1);
        gltf.scene.position.set(0, 0, 1);
        gltf.scene.rotation.y = Math.PI / 4;

        gltf.scene.traverse((child) => {
            if (child.isMesh) {
                console.log('Mesh found:', child.name, child.material);
                if (child.material) {
                    const materials = Array.isArray(child.material) ? child.material : [child.material];

                    materials.forEach(material => {
                        if (material.map) {
                            material.map.colorSpace = THREE.SRGBColorSpace;  
                            console.log('Texture found:', material.map);
                        }
                        material.needsUpdate = true;
                    });
                }
            }
        });

        scene.add(gltf.scene);
        console.log('GLTF model loaded successfully');
    },

    function (xhr) {
        console.log(('GLTF model ' + (xhr.loaded / xhr.total * 100) + '% loaded'));
    },
    function (error) {
        console.error('An error happened while loading the GLTF model:', error);
    }
);

function resizeRender(renderer)
{ 
    const canvas = renderer.domElement;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize){
        renderer.setSize(width, height, false);
    }
    return needResize;
}

function animate() {
    requestAnimationFrame(animate);

    if (resizeRender(renderer)) {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
    }


    controls.update();
    renderer.render(scene, camera);
}

animate();


