export function getLocalState( state ){
  if(typeof state.get === 'function') {
    return state.get( 'local' );
  }
  return state.local;
};
