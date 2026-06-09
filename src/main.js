import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { mergeVertices } from 'three/addons/utils/BufferGeometryUtils.js';
import { scanImageData } from '@undecaf/zbar-wasm';
import { FourPointsControls } from 'four-points-controls';

var video = document.createElement("video");
var canvasElement = document.getElementById("canvas");
var canvas = canvasElement.getContext("2d");
var infoMessage = document.getElementById("info");

function drawLine(canvas, begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.strokeStyle = color;
  canvas.stroke();
}

function writeText(canvas, pointA, pointB, data, color) {
  const x = (pointA.x + pointB.x) / 2;
  const y = (pointA.y + pointB.y) / 2;
  canvas.textAlign = "center";
  canvas.fillStyle = color;
  canvas.fillText(data, x, y + 10);
}

// Use facingMode: environment to attemt to get the front camera on phones
navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment", width: { min: 1080 }, height: { min: 1080 } } }).then(function(stream) {
  video.srcObject = stream;
  video.setAttribute("playsinline", true); // required to tell iOS safari we don't want fullscreen
  video.play();
});

async function findZbarWasm(imageData) {
  const symbols = await scanImageData(imageData);
  if (symbols.length == 0) {
    infoMessage.hidden = true;
    controls.visible = false;
  } else {
    controls.visible = true;
    infoMessage.hidden = false;
    symbols.forEach(symbol => {
      const points = symbol.points;
      const normalized = [];
      const data = symbol.decode('utf-8');
      infoMessage.innerText = data;

      // For debugging
      // drawLine(canvas, { x: 0, y: 0 }, points[0], "#FF0000");
      // drawLine(canvas, { x: 0, y: canvasElement.height }, points[1], "#FF0000");
      // drawLine(canvas, { x: canvasElement.width, y: canvasElement.height }, points[2], "#FF0000");
      // drawLine(canvas, { x: canvasElement.width, y: 0 }, points[3], "#FF0000");
      // writeText(canvas, points[1], points[2], data, "#00FF00");

      points.forEach(p => {
        normalized.push((p.x / canvasElement.width) * 2 - 1);
        normalized.push(-((p.y / canvasElement.height) * 2 - 1));
      });
      controls.points = [
        new THREE.Vector2(normalized[6], normalized[7]),
        new THREE.Vector2(normalized[4], normalized[5]),
        new THREE.Vector2(normalized[2], normalized[3]),
        new THREE.Vector2(normalized[0], normalized[1]),
      ];
    });
  }
}

// Basic Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0);
renderer.setClearAlpha(0x0);
document.body.appendChild(renderer.domElement);

// const mesh = new THREE.BoxHelper(new THREE.Mesh(geometry), 0x77ff00); // For debug
const mesh = new THREE.Group();
scene.add(mesh);

new GLTFLoader().load('/assets/duck.glb', function(gltf) {
  gltf.scene.scale.setScalar(0.7);
  gltf.scene.rotation.x = Math.PI / 2;
  gltf.scene.traverse(fixDuckingNormals);
  mesh.add(gltf.scene);
});

// const controls = FourPointsControls(camera, renderer.domElement); // For debugging
const controls = FourPointsControls(camera);
controls.method = FourPointsControls.exact4;

controls.visible = false;
controls.add(mesh);
scene.add(controls);

// Add lights
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);
const ambientLight = new THREE.AmbientLight(0x404060);
scene.add(ambientLight);

camera.position.z = 10;

// Animation loop
function animate() {
  infoMessage.innerText = "Loading video..."
  if (video.readyState === video.HAVE_ENOUGH_DATA) {
    infoMessage.hidden = true;
    infoMessage.innerText = '';
    canvasElement.hidden = false;

    canvasElement.width = video.videoWidth;
    canvasElement.height = video.videoHeight;
    canvas.drawImage(video, 0, 0, canvasElement.width, canvasElement.height);
    var imageData = canvas.getImageData(0, 0, canvasElement.width, canvasElement.height);

    findZbarWasm(imageData);
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

function fixDuckingNormals(o) {
  if (o.geometry) {
    delete o.geometry.attributes.normal;
    o.geometry = mergeVertices(o.geometry);
    o.geometry.computeVertexNormals();
  }
}
