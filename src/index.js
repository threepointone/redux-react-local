import local from './decorator';
import reducer from './reducer';
import Root from './root';
import {Optimist} from './optimist';
import {Sagas, Saga} from './sagas';

import ensureFSA from './ensure-fsa';

module.exports = {
  local,
  reducer,
  Root,
  Optimist,
  Sagas,
  Saga,
  ensureFSA
};
