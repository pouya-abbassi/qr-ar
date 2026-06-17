// main.js
import * as THREE from 'three';
import { setupCamera } from './camera.js';
import { setupThree, setupLights, setupControls, handleResize } from './three-setup.js';
import { loadModel } from './model-loader.js';
import { initQRScanner, findZbarWasm, updateControlsFromSmoothedCorners } from './qr-scanner.js';
import { resetSmoothing, setCurrentSmoothedCorners } from './smoothing.js';

// DOM Elements
const canvasElement = document.getElementById("canvas");
const infoMessage = document.getElementById("info");
const video = document.createElement("video");

// Initialize Three.js
const { scene, camera, renderer } = setupThree();
const mesh = new THREE.Group();
scene.add(mesh);

setupLights(scene);
const controls = setupControls(camera, mesh);
scene.add(controls);

// Get model data from URL fragment
const fragment = window.location.hash.substring(1);

// Load 3D model
loadModel(mesh, fragment).catch(console.error);

// Initialize QR Scanner
initQRScanner(controls, canvasElement, infoMessage);

// Setup camera
setupCamera(video).catch(console.error);

// Get canvas context
const canvasContext = canvasElement.getContext("2d");

// Animation loop for smooth controls
function updateSmoothControls() {
  if (canvasElement.width > 0) {
    updateControlsFromSmoothedCorners(controls, canvasElement);
  }
  requestAnimationFrame(updateSmoothControls);
}
updateSmoothControls();

// Main animation loop
function animate() {
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    infoMessage.hidden = true;
    canvasElement.hidden = false;

    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    canvasContext.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    const imageData = canvasContext.getImageData(0, 0, canvasElement.width, canvasElement.height);

    findZbarWasm(imageData);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

// Handle window resize
window.addEventListener('resize', () => handleResize(camera, renderer));

// Reset smoothing when page loads
resetSmoothing();
