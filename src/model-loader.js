// model-loader.js
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { MODEL } from './config.js';

function fixNormals(o) {
  if (o.geometry) {
    delete o.geometry.attributes.normal;
    o.geometry = mergeVertices(o.geometry);
    o.geometry.computeVertexNormals();
  }
}

export function loadModel(mesh) {
  return new Promise((resolve, reject) => {
    new GLTFLoader().load(MODEL.PATH, (gltf) => {
      gltf.scene.scale.setScalar(MODEL.SCALE);
      gltf.scene.rotation.x = MODEL.ROTATION_X;
      gltf.scene.traverse(fixNormals);
      mesh.add(gltf.scene);
      resolve(gltf);
    }, undefined, reject);
  });
}
