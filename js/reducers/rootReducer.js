const React = require('react');
const {mouseReducer} = require('bens_ui_components');
const {makeRandomBubble} = require('../state');
const {add, dist} = require('bens_utils').vectors;
const {clamp} = require('bens_utils').math;
const {randomIn, normalIn} = require('bens_utils').stochastic;
const {config} = require('../config');

const rootReducer = (state, action) => {
  if (state === undefined) return initState();

  switch (action.type) {
    case 'SET_MOUSE_DOWN':
    case 'SET_MOUSE_POS':
      return {
        ...state,
        mouse: mouseReducer(state.mouse, action),
      };
    case 'TICK':
      return tick(state);
    case 'POP': {
      const {position} = action;
      const nextBubbles = [];
      for (const bubble of state.bubbles) {
        if (dist(position, bubble.position) > bubble.radius) {
          nextBubbles.push(bubble);
        }
      }
      return {...state, bubbles: nextBubbles};
    }
  }
  return state;
};


//////////////////////////////////////
// Tick
const tick = (state) => {

  // update all bubbles
  const nextBubbles = [];
  for (const bubble of state.bubbles) {
    // update positions based on velocity
    bubble.position = add(bubble.position, bubble.velocity);
    // tweak velocity
    bubble.velocity = add(bubble.velocity,
      {
        x: normalIn(-10, 10) / 40,
        y: normalIn(-10, 10) / 20,
      }
    );
    bubble.velocity.y = clamp(bubble.velocity.y, -1, -0.2);

    // remove bubbles that have gone out the top of the screen
    if (bubble.position.y > -1 * bubble.radius) {
      nextBubbles.push(bubble);
    }
  }

  // make random bubble
  if (Math.random() < config.spawnRate) {
    nextBubbles.push(makeRandomBubble());
  }

  return {
    ...state,
    bubbles: nextBubbles.sort((a,b) => a.radius - b.radius),
  };
};


//////////////////////////////////////
// Initializations
const initState = () => {
  return {
    bubbles: [],
  };
}

module.exports = {rootReducer, initState};
