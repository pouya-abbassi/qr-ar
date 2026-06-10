// camera.js
import { CAMERA } from './config.js';

export function setupCamera(videoElement) {
  return navigator.mediaDevices.getUserMedia({
    video: {
      facingMode: CAMERA.FACING_MODE,
      width: { min: CAMERA.MIN_WIDTH },
      height: { min: CAMERA.MIN_HEIGHT }
    }
  }).then(stream => {
    videoElement.srcObject = stream;
    videoElement.setAttribute("playsinline", true);
    videoElement.play();
    return stream;
  });
}
