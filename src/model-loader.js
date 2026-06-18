// model-loader.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

async function getModel(fragment = 'duck') {
  try {
    const response = await fetch('./json/' + fragment + '.json');
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Failed to fetch model data. Error: ', error);
    return {
      error: error
    }
  }
}

function fixNormals(o) {
  if (o.geometry) {
    delete o.geometry.attributes.normal;
    o.geometry = mergeVertices(o.geometry);
    o.geometry.computeVertexNormals();
  }
}

function loadModel(mesh, model) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(model.path, (gltf) => {
      gltf.scene.scale.setScalar(model.scale || 2);
      gltf.scene.rotation.x = model.rotation_x || 0;
      gltf.scene.rotation.y = model.rotation_y || 0;
      gltf.scene.rotation.z = model.rotation_z || 0;
      gltf.scene.castShadow = true;
      gltf.scene.traverse(fixNormals);
      mesh.add(gltf.scene);
      resolve(gltf);
    }, undefined, reject);
  });
}

function loadVideo(mesh, model, userVideo) {
  return new Promise((resolve, reject) => {
    userVideo.src = model.path;
    userVideo.loop = model.loop || true;
    userVideo.muted = model.muted || false;
    userVideo.autoplay = false;
    userVideo.playInline = true;
    userVideo.style.position = 'fixed';
    userVideo.style.top = 0;
    userVideo.style.left = 0;
    userVideo.style.width = "100%";
    userVideo.style.height = "100%";
    userVideo.style.objectFit = 'contain';
    userVideo.style.zIndex = '-1';
    userVideo.style.pointerEvents = 'none';

    userVideo.addEventListener('canplay', () => {
      resolve(userVideo);
    });

    userVideo.addEventListener('error', (error) => {
      console.error('Failed to load video: ', error);
    });

    userVideo.load();

    // Displaying video in scene
    const texture = new THREE.VideoTexture(userVideo);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.format = THREE.RGBFormat;

    const aspect = model.width / model.height;
    const planeWidth = 10;
    const planeHeight = planeWidth / aspect;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      side: THREE.DoubleSide,
      transparent: true,
    });

    const plane = new THREE.Mesh(geometry, material);
    plane.position.set(0, 0, 0);

    const videoContainer = new THREE.Group();
    videoContainer.rotation.z = Math.PI / 2;
    videoContainer.add(plane);

    const borderGeometry = new THREE.EdgesGeometry(geometry);
    const borderMaterial = new THREE.LineBasicMaterial({ color: 0xFFAA44 });
    const border = new THREE.LineSegments(borderGeometry, borderMaterial);
    plane.add(border);
    mesh.add(videoContainer);

    console.log('Video displayed in scene');
  });
}

export async function createObject(mesh, fragment, userVideo) {
  const model = await getModel(fragment);
  if (model.type === "3d") {
    loadModel(mesh, model);
  } else if (model.type === "video") {
    loadVideo(mesh, model, userVideo);
  } else {
    loadModel(mesh, {
      path: './3d/duck.glb',
      scale: 0.7,
      rotation_x: 1.5707963267948966, // Math.PI / 2
    })
  };
}
