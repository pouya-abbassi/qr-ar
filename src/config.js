// config.js
export const SMOOTHING = {
  BUFFER_SIZE: 5,
  FALLBACK_TIME: 250,
  MOVEMENT_SPEED: 0.15,
  MIN_CONFIDENCE: 0.6,
};

export const CAMERA = {
  FACING_MODE: "environment",
  MIN_WIDTH: 1080,
  MIN_HEIGHT: 1080,
};

export const THREE_SETUP = {
  CAMERA_FOV: 50,
  CAMERA_NEAR: 0.1,
  CAMERA_FAR: 2000,
  CAMERA_POSITION_Z: 10,
};

export const MODEL = {
  PATH: './3d/duck.glb',
  SCALE: 0.7,
  ROTATION_X: Math.PI / 2,
};

export const isLocalhost =
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname === '';
