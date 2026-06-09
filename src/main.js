import * as THREE from 'three';
import { scanImageData } from '@undecaf/zbar-wasm';

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
  requestAnimationFrame(tick);
});

async function findZbarWasm(imageData) {
  const symbols = await scanImageData(imageData);
  if (symbols.length == 0) {
    infoMessage.hidden = true;
  } else {
    infoMessage.hidden = false;
    symbols.forEach(symbol => {
      const points = symbol.points;
      const data = symbol.decode('utf-8');
      infoMessage.innerText = data;
      drawLine(canvas, points[0], points[1], "#FF0000");
      drawLine(canvas, points[1], points[2], "#FF0000");
      drawLine(canvas, points[2], points[3], "#FF0000");
      drawLine(canvas, points[3], points[0], "#FF0000");
      writeText(canvas, points[1], points[2], data, "#00FF00");
      writeText(canvas, points[0], points[2], `${points[0].x} x ${points[0].y}`, "#0000FF");
    });
  }
}

function tick() {
  infoMessage.innerText = "⌛ Loading video..."
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
  requestAnimationFrame(tick);
}

// Basic Three.js Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 2000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0);
renderer.setClearAlpha(0x0);
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

camera.position.z = 30;

// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.x += 0.01;
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();
