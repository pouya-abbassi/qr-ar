// model-loader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';

async function getModel(fragment = 'duck') {
  try {
    const response = await fetch('/json/' + fragment + '.json');
    if (!response.ok) {
      throw new Error(`HTTP error. Status: ${response.status}`);
    }
    const config = await response.json();
    return config;
  } catch (error) {
    console.error('Failed to fetch model data. Error: ', error);
    return {
      path: './3d/duck.glb',
      scale: 0.7,
      rotation_x: 1.5707963267948966, // Math.PI / 2
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

export async function loadModel(mesh, fragment) {
  const model = await getModel(fragment);
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
