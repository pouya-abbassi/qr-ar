// qr-scanner.js
import { scanImageData } from '@undecaf/zbar-wasm';
import {
  smoothCorners,
  getLastValidCorners,
  getLastValidTime,
  getCurrentSmoothedCorners,
  getCurrentTargetCorners,
  setLastValidCorners,
  setLastValidTime,
  setCurrentTargetCorners,
  setCurrentSmoothedCorners,
  resetSmoothing,
  getInterpolatedCorners
} from './smoothing.js';
import { drawDebugBorders, drawDebugLines } from './utils.js';
import { SMOOTHING, isLocalhost } from './config.js';
import * as THREE from 'three';

let controlsRef = null;
let canvasElementRef = null;
let canvasContextRef = null;
let infoMessageRef = null;

export function initQRScanner(controls, canvasElement, infoMessage) {
  controlsRef = controls;
  canvasElementRef = canvasElement;
  canvasContextRef = canvasElement.getContext("2d");
  infoMessageRef = infoMessage;
}

export async function findZbarWasm(imageData) {
  if (!canvasContextRef || !canvasElementRef) return false;

  const canvas = canvasContextRef;
  const canvasElement = canvasElementRef;

  if (isLocalhost) {
    drawDebugBorders(canvas, canvasElement.width, canvasElement.height);
  }

  const symbols = await scanImageData(imageData);

  if (symbols.length > 0 && symbols[0].points && symbols[0].points.length === 4) {
    const rawPoints = symbols[0].points;
    const data = symbols[0].decode('utf-8');

    const smoothResult = smoothCorners(rawPoints);

    if (smoothResult && smoothResult.confidence >= SMOOTHING.MIN_CONFIDENCE) {
      // Update state
      setCurrentTargetCorners(smoothResult.corners);
      setLastValidCorners(smoothResult.corners);
      setLastValidTime(Date.now());

      if (infoMessageRef) {
        infoMessageRef.innerText = data;
        infoMessageRef.hidden = false;
      }
      if (controlsRef) controlsRef.visible = true;

      if (isLocalhost) {
        drawDebugLines(canvas, canvasElement.width, canvasElement.height, rawPoints, data);
      }

      return true;
    }
  } else {
    const lastValidTime = getLastValidTime();
    if (Date.now() - lastValidTime >= SMOOTHING.FALLBACK_TIME) {
      if (infoMessageRef) infoMessageRef.hidden = true;
      if (controlsRef) controlsRef.visible = false;
      resetSmoothing();
    }
  }

  return false;
}

export function updateControlsFromSmoothedCorners(controls, canvasElement) {
  const currentTarget = getCurrentTargetCorners();
  const currentSmoothed = getCurrentSmoothedCorners();
  const lastValid = getLastValidCorners();

  if (currentTarget && lastValid) {
    // Interpolate corners for smooth movement
    const interpolated = getInterpolatedCorners(currentTarget, currentSmoothed);

    if (interpolated) {
      setCurrentSmoothedCorners(interpolated);

      // Convert to NDC and update controls
      const normalized = [];
      interpolated.forEach(p => {
        normalized.push((p.x / canvasElement.width) * 2 - 1);
        normalized.push(-((p.y / canvasElement.height) * 2 - 1));
      });

      controls.points = [
        new THREE.Vector2(normalized[6], normalized[7]),
        new THREE.Vector2(normalized[4], normalized[5]),
        new THREE.Vector2(normalized[2], normalized[3]),
        new THREE.Vector2(normalized[0], normalized[1]),
      ];

      return true;
    }
  }

  return false;
}
