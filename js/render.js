const {subtract, vectorTheta, dist, equals} = require('bens_utils').vectors;
const {
  intersectCircles, intersectLines,
  intersectLineCircle,
} = require('./selectors/selectors');
const {config} = require('./config');

const render = (state) => {
  const canvas = document.getElementById('canvas');
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = 'darkgray';
  ctx.fillRect(0, 0, config.worldSize.width, config.worldSize.height);

  let allLines = []
  // draw bubbles;
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
    for (let j = i - 1; j >= 0; j--) {
      const other = state.bubbles[j];
      const line = intersectCircles(bubble, other);
      if (line.length == 0) continue;

      ctx.strokeStyle = "steelblue";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(
        bubble.position.x, bubble.position.y,
        bubble.radius,
        vectorTheta(subtract(line[0], bubble.position)),
        vectorTheta(subtract(line[1], bubble.position)),
      );
      ctx.stroke();
      ctx.closePath();

      allLines.push({line, bubble, other});
    }
  }

  // compute lines that intersect
  for (let i = 0; i < allLines.length; i++) {
    const line = allLines[i];

    // for (let j = i + 1; j < allLines.length; j++) {
    //   const other = allLines[j];
    //   const point = intersectLines(line.line, other.line);
    //   if (!point) continue;

    //   let start = line.line[0];
    //   let end = line.line[1];
    //   if (
    //     dist(start, other.bubble.position) < other.bubble.radius - 0.1 ||
    //     dist(start, other.other.position) < other.other.radius - 0.1
    //   ) {
    //     start = point;
    //   }
    //   if (
    //     dist(end, other.bubble.position) < other.bubble.radius - 0.1 ||
    //     dist(end, other.other.position) < other.other.radius - 0.1
    //   ) {
    //     end = point;
    //   }
    //   line.line[0] = start;
    //   line.line[1] = end;

    //   start = other.line[0];
    //   end = other.line[1];
    //   if (
    //     dist(start, line.bubble.position) < line.bubble.radius - 0.1 ||
    //     dist(start, line.other.position) < line.other.radius - 0.1
    //   ) {
    //     start = point;
    //   }
    //   if (
    //     dist(end, line.bubble.position) < line.bubble.radius - 0.1 ||
    //     dist(end, line.other.position) < line.other.radius - 0.1
    //   ) {
    //     end = point;
    //   }
    //   other.line[0] = start;
    //   other.line[1] = end;
    // }
    for (let j = i + 1; j < allLines.length; j++) {
      const other = allLines[j];
      const point = intersectLines(line.line, other.line);
      if (!point) continue;

      let start = line.line[0];
      let end = line.line[1];
      if (
        (
          dist(start, other.bubble.position) < other.bubble.radius &&
          line.bubble.id != other.bubble.id && line.other.id != other.bubble.id
        ) || (
          dist(start, other.other.position) < other.other.radius &&
          line.bubble.id != other.other.id && line.other.id != other.other.id
        )
      ) {
        start = point;
      }
      if (
        (
          dist(end, other.bubble.position) < other.bubble.radius &&
          line.bubble.id != other.bubble.id && line.other.id != other.bubble.id
        ) || (
          dist(end, other.other.position) < other.other.radius &&
          line.bubble.id != other.other.id && line.other.id != other.other.id
        )
      ) {
        end = point;
      }
      line.line[0] = start;
      line.line[1] = end;

      start = other.line[0];
      end = other.line[1];
      if (
        (
          dist(start, line.bubble.position) < line.bubble.radius &&
          other.bubble.id != line.bubble.id && other.other.id != line.bubble.id
        ) || (
          dist(start, line.other.position) < line.other.radius &&
          other.bubble.id != line.other.id && other.other.id != line.other.id
        )
      ) {
        start = point;
      }
      if (
        (
          dist(end, line.bubble.position) < line.bubble.radius &&
          other.bubble.id != line.bubble.id && other.other.id != line.bubble.id
        ) || (
          dist(end, line.other.position) < line.other.radius &&
          other.bubble.id != line.other.id && other.other.id != line.other.id
        )
      ) {
        end = point;
      }
      other.line[0] = start;
      other.line[1] = end;
    }
  }

  // filter lines that are entirely inside of a bubble:
  const nextAllLines = [];
  for (const line of allLines)  {
    let dontAdd = false;
    for (const bubble of state.bubbles) {
      if (line.bubble.id == bubble.id || line.other.id == bubble.id) continue;
      if (
        dist(line.line[0], bubble.position) < bubble.radius &&
        dist(line.line[1], bubble.position) < bubble.radius
      ) {
        dontAdd = true;
        break;
      }
    }
    if (!dontAdd) {
      nextAllLines.push(line);
    }
  }
  allLines = nextAllLines;

  // draw lines between bubbles
  ctx.lineWidth = 2;
  let i = 0;
  ctx.strokeStyle = "blue";
  for (const line of allLines) {
    const start = line.line[0];
    const end = line.line[1];
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
    i++;
  }

}

window.render = render;

module.exports = {
  render,
};
