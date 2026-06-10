// smoothing.js
import { SMOOTHING } from './config.js';

// Smoothing state (single source of truth)
let cornerBuffer = [];
let lastValidCorners = null;
let lastValidTime = 0;
let currentSmoothedCorners = null;
let currentTargetCorners = null;

export function smoothCorners(newCorners) {
  if (!newCorners || newCorners.length !== 4) return null;

  cornerBuffer.push(newCorners.map(p => ({ x: p.x, y: p.y })));
  if (cornerBuffer.length > SMOOTHING.BUFFER_SIZE) {
    cornerBuffer.shift();
  }

  const smoothed = [
    { x: 0, y: 0 }, { x: 0, y: 0 },
    { x: 0, y: 0 }, { x: 0, y: 0 }
  ];

  let totalWeight = 0;
  cornerBuffer.forEach((frame, idx) => {
    const weight = idx + 1;
    totalWeight += weight;
    frame.forEach((corner, i) => {
      smoothed[i].x += corner.x * weight;
      smoothed[i].y += corner.y * weight;
    });
  });

  smoothed.forEach(corner => {
    corner.x /= totalWeight;
    corner.y /= totalWeight;
  });

  let confidence = 1.0;
  if (cornerBuffer.length >= 2) {
    const latest = cornerBuffer[cornerBuffer.length - 1];
    const previous = cornerBuffer[cornerBuffer.length - 2];
    let maxDelta = 0;
    for (let i = 0; i < 4; i++) {
      const delta = Math.hypot(latest[i].x - previous[i].x, latest[i].y - previous[i].y);
      maxDelta = Math.max(maxDelta, delta);
    }
    confidence = Math.max(0, Math.min(1, 1 - maxDelta / 50));
  }

  return { corners: smoothed, confidence };
}

export function getInterpolatedCorners(target, current, factor = SMOOTHING.MOVEMENT_SPEED) {
  if (!current) return target.map(c => ({ x: c.x, y: c.y }));

  const interpolated = [];
  for (let i = 0; i < 4; i++) {
    interpolated.push({
      x: current[i].x + (target[i].x - current[i].x) * factor,
      y: current[i].y + (target[i].y - current[i].y) * factor
    });
  }
  return interpolated;
}

// Getter functions for state
export function getLastValidCorners() { return lastValidCorners; }
export function getLastValidTime() { return lastValidTime; }
export function getCurrentSmoothedCorners() { return currentSmoothedCorners; }
export function getCurrentTargetCorners() { return currentTargetCorners; }

// Setter functions for state
export function setLastValidCorners(corners) { lastValidCorners = corners; }
export function setLastValidTime(time) { lastValidTime = time; }
export function setCurrentSmoothedCorners(corners) { currentSmoothedCorners = corners; }
export function setCurrentTargetCorners(corners) { currentTargetCorners = corners; }

export function resetSmoothing() {
  cornerBuffer = [];
  lastValidCorners = null;
  lastValidTime = 0;
  currentSmoothedCorners = null;
  currentTargetCorners = null;
}
