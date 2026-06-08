import * as THREE from 'three';
import jsQR from 'jsqr';

console.log('Three.js version:', THREE.REVISION);
console.log('jsQR loaded:', typeof jsQR);

// Basic Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x111122);
document.body.appendChild(renderer.domElement);

// Add a simple rotating cube to verify Three.js is working
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Add lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

camera.position.z = 3;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

console.log('App is running!');
