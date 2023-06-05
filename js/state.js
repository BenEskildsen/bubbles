const {randomIn, normalIn} = require('bens_utils').stochastic;
const {config} = require('./config');

const makeBubble = (
  radius, position, velocity,
) => {
  return {
    position,
    radius,
    velocity,
  }
};

const makeRandomBubble = () => {
  const {width, height} = config.worldSize;
  return makeBubble(
    randomIn(12, 35),
    {x: randomIn(0, width), y: height + 24},
    {x: 0, y: -1 * normalIn(0, 100) / 80},
  );
};

module.exports = {
  makeBubble,
  makeRandomBubble,
};
