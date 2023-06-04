const React = require('react');
const {config} = require('../config');
const {render} = require('../render');
const {Canvas, useEnhancedReducer, useMouseHandler,} = require('bens_ui_components');
const {rootReducer, initState} = require('../reducers/rootReducer');
const {normalizePos} = require('../selectors/selectors');
const {useEffect, useState, useMemo} = React;


function Main(props) {
  const [state, dispatch, getState] = useEnhancedReducer(
    rootReducer, initState(),
  );
  window.getState = getState;
  window.dispatch = dispatch;

  useEffect(() => {
    let tickInterval = setInterval(
      () => {
        dispatch({type: 'TICK'});
        render(getState());
      },
      config.msPerTick,
    );

    return () => {
      clearInterval(tickInterval);
    };
  }, []);

  useEffect(() => {
    if (window.innerWidth < window.innerHeight) {
      config.worldSize = {
        width: config.worldSize.height,
        height: config.worldSize.width,
      };
    }
  }, []);

  useMouseHandler('canvas', {dispatch, getState},
    {leftDown: (state, dispatch, pos) => {
      dispatch({type: 'POP', position: normalizePos(pos)});
    }}
  );

  return (
    <Canvas
      view={config.worldSize}
      // width={config.worldSize.width}
      // height={config.worldSize.height}
      useFullScreen={true}
    />
  )
}

module.exports = Main;
