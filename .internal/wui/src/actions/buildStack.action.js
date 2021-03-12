import { createAndBuildStack } from '../services/builds'

const CREATE_AND_BUILD_STACK = 'CREATE_AND_BUILD_STACK';
const RESET_STATE_CREATE_AND_BUILD_STACK = 'RESET_STATE_CREATE_AND_BUILD_STACK';

const createAndBuildStackAction = (selectedServices, serviceConfigurations) => {
  return {
    type: CREATE_AND_BUILD_STACK,
    promise: createAndBuildStack({ selectedServices, serviceConfigurations })
  }
};

const clearBuildStateAction = () => {
  return {
    type: RESET_STATE_CREATE_AND_BUILD_STACK
  }
};

export {
  CREATE_AND_BUILD_STACK,
  RESET_STATE_CREATE_AND_BUILD_STACK,
  createAndBuildStackAction,
  clearBuildStateAction
};
