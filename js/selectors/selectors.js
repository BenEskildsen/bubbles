const {dist} = require('bens_utils').vectors;
const {config} = require('../config');

const normalizePos = (pos) => {
  const {worldSize} = config;
  const width = window.innerWidth;
  const height = window.innerHeight;
  return {
    x: pos.x * worldSize.width / width,
    y: pos.y * worldSize.height / height,
  };
}

// based on the math here:
// http://math.stackexchange.com/a/1367732

// x1,y1 is the center of the first circle, with radius r1
// x2,y2 is the center of the second ricle, with radius r2
function intersectCircles(circle1, circle2) {
  const x1 = circle1.position.x;
  const y1 = circle1.position.y;
  const r1 = circle1.radius;
  const x2 = circle2.position.x;
  const y2 = circle2.position.y;
  const r2 = circle2.radius;

  var centerdx = x1 - x2;
  var centerdy = y1 - y2;
  var R = Math.sqrt(centerdx * centerdx + centerdy * centerdy);
  if (!(Math.abs(r1 - r2) <= R && R <= r1 + r2)) { // no intersection
    return []; // empty list of results
  }
  // intersection(s) should exist

  var R2 = R*R;
  var R4 = R2*R2;
  var a = (r1*r1 - r2*r2) / (2 * R2);
  var r2r2 = (r1*r1 - r2*r2);
  var c = Math.sqrt(2 * (r1*r1 + r2*r2) / R2 - (r2r2 * r2r2) / R4 - 1);

  var fx = (x1+x2) / 2 + a * (x2 - x1);
  var gx = c * (y2 - y1) / 2;
  var ix1 = fx + gx;
  var ix2 = fx - gx;

  var fy = (y1+y2) / 2 + a * (y2 - y1);
  var gy = c * (x1 - x2) / 2;
  var iy1 = fy + gy;
  var iy2 = fy - gy;

  // note if gy == 0 and gx == 0 then the circles are tangent and there is only one solution
  // but that one solution will just be duplicated as the code is currently written
  return [{x: ix1, y: iy1}, {x: ix2, y: iy2}];
}

function intersectLines(line1, line2) {
  // extract the coordinates of the start and end points of each line
  const {x: x1, y: y1} = line1[0];
  const {x: x2, y: y2} = line1[1];
  const {x: x3, y: y3} = line2[0];
  const {x: x4, y: y4} = line2[1];

  // calculate the denominator of the equations for the parameter values t and u
  const denom = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);

  // if the denominator is zero, the lines are parallel and don't intersect
  if (denom === 0) {
    return null;
  }

  // calculate the parameter values for each line
  const t = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denom;
  const u = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denom;

  // if the parameter values are outside the interval [0, 1], the lines don't intersect
  if (t < 0 || t > 1 || u < 0 || u > 1) {
    return null;
  }

  // calculate the intersection point
  const x = x1 + t * (x2 - x1);
  const y = y1 + t * (y2 - y1);
  return {x, y};
}

function intersectLineCircle(line, circle) {
  // extract the coordinates of the start and end points of the line and the circle position and radius
  const { x: x1, y: y1 } = line[0];
  const { x: x2, y: y2 } = line[1];
  const { x: cx, y: cy } = circle.position;
  const r = circle.radius;

  // calculate the direction vector of the line
  const dx = x2 - x1;
  const dy = y2 - y1;

  // calculate the coefficients of the quadratic equation for the intersection points
  const a = dx * dx + dy * dy;
  const b = 2 * dx * (x1 - cx) + 2 * dy * (y1 - cy);
  const c = cx * cx + cy * cy + x1 * x1 + y1 * y1 - 2 * (cx * x1 + cy * y1) - r * r;

  // calculate the discriminant of the quadratic equation
  const disc = b * b - 4 * a * c;

  // if the discriminant is negative, the line doesn't intersect the circle
  if (disc < 0) {
    return null;
  }

  // calculate the parameter values for the intersection points
  const t1 = (-b - Math.sqrt(disc)) / (2 * a);
  const t2 = (-b + Math.sqrt(disc)) / (2 * a);

  // calculate the coordinates of the intersection points
  const p1 = { x: x1 + dx * t1, y: y1 + dy * t1 };
  const p2 = { x: x1 + dx * t2, y: y1 + dy * t2 };

  // check if any of the intersection points lie on the line segment
  const onSegment1 = isOnSegment(line, p1);
  const onSegment2 = isOnSegment(line, p2);

  // return the intersection point on the line segment or null if there is none
  if (onSegment1) {
    return p1;
  } else if (onSegment2) {
    return p2;
  } else {
    return null;
  }
}

// helper function to check if a point is on a line segment
function isOnSegment(line, point) {
  const { x: x1, y: y1 } = line[0];
  const { x: x2, y: y2 } = line[1];
  const { x, y } = point;

  const minX = Math.min(x1, x2);
  const maxX = Math.max(x1, x2);
  const minY = Math.min(y1, y2);
  const maxY = Math.max(y1, y2);

  return x >= minX && x <= maxX && y >= minY && y <= maxY;
}

module.exports = {
  normalizePos,
  intersectCircles,
  intersectLines,
  intersectLineCircle,
};
