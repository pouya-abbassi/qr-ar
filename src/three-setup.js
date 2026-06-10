// three-setup.js
import * as THREE from 'three';
import { FourPointsControls } from 'four-points-controls';
import { THREE_SETUP } from './config.js';

export function setupThree() {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    THREE_SETUP.CAMERA_FOV,
    window.innerWidth / window.innerHeight,
    THREE_SETUP.CAMERA_NEAR,
    THREE_SETUP.CAMERA_FAR
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0);
  renderer.setClearAlpha(0x0);
  document.body.appendChild(renderer.domElement);

  camera.position.z = THREE_SETUP.CAMERA_POSITION_Z;

  return { scene, camera, renderer };
}

export function setupLights(scene) {
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 10, 7);
  scene.add(light);

  const ambientLight = new THREE.AmbientLight(0x404060);
  scene.add(ambientLight);
}

export function setupControls(camera, mesh) {
  const controls = FourPointsControls(camera);
  controls.method = FourPointsControls.exact4;
  controls.visible = false;
  controls.add(mesh);
  return controls;
}

export function handleResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
