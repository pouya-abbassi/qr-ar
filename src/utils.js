// utils.js
export function drawLine(canvas, begin, end, color) {
  canvas.beginPath();
  canvas.moveTo(begin.x, begin.y);
  canvas.lineTo(end.x, end.y);
  canvas.strokeStyle = color;
  canvas.stroke();
}

export function writeText(canvas, pointA, pointB, data, color) {
  const x = (pointA.x + pointB.x) / 2;
  const y = (pointA.y + pointB.y) / 2;
  canvas.textAlign = "center";
  canvas.fillStyle = color;
  canvas.fillText(data, x, y + 10);
}

export function drawDebugBorders(canvas, width, height) {
  drawLine(canvas, { x: 10, y: 10 }, { x: 10, y: height - 10 }, '#0000FF');
  drawLine(canvas, { x: 10, y: height - 10 }, { x: width - 10, y: height - 10 }, '#0000FF');
  drawLine(canvas, { x: width - 10, y: 10 }, { x: width - 10, y: height - 10 }, '#0000FF');
  drawLine(canvas, { x: 10, y: 10 }, { x: width - 10, y: 10 }, '#0000FF');
}

export function drawDebugLines(canvas, width, height, rawPoints, data) {
  drawLine(canvas, { x: 0, y: 0 }, rawPoints[0], "#FF0000");
  drawLine(canvas, { x: 0, y: height }, rawPoints[1], "#FF0000");
  drawLine(canvas, { x: width, y: height }, rawPoints[2], "#FF0000");
  drawLine(canvas, { x: width, y: 0 }, rawPoints[3], "#FF0000");
  writeText(canvas, rawPoints[1], rawPoints[2], data, "#00FF00");
}
