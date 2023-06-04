const {subtract, vectorTheta} = require('bens_utils').vectors;
const {intersectPoints} = require('./selectors/selectors');
const {config} = require('./config');

const render = (state) => {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = 'darkgray';
  ctx.fillRect(0, 0, config.worldSize.width, config.worldSize.height);

  for (let i = 0; i < state.bubbles.length; i++) {
    const bubble = state.bubbles[i];
    ctx.fillStyle = "steelblue";
    ctx.lineWidth = 2;
    ctx.strokeStyle = "blue";
    ctx.beginPath();
    ctx.arc(
      bubble.position.x, bubble.position.y,
      bubble.radius,
      0, 2*Math.PI,
    );
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // check for overlaps:
    for (let j = i - 1; j > 0; j--) {
      const other = state.bubbles[j];
      const points = intersectPoints(bubble, other);
      if (points.length == 0) continue;

      ctx.strokeStyle = "steelblue";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        bubble.position.x, bubble.position.y,
        bubble.radius,
        // 0, 2 * Math.PI,
        vectorTheta(subtract(points[0], bubble.position)),
        vectorTheta(subtract(points[1], bubble.position)),
      );
      ctx.stroke();
      ctx.closePath();

      ctx.beginPath();
      ctx.lineWidth = 2;
      ctx.strokeStyle = "blue";
      ctx.moveTo(points[0].x, points[0].y);
      ctx.lineTo(points[1].x, points[1].y);
      ctx.stroke();

    }

  }

}

module.exports = {
  render,
};
