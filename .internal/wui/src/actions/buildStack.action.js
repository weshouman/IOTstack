import { createAndBuildStack } from '../services/builds'

const CREATE_AND_BUILD_STACK = 'CREATE_AND_BUILD_STACK';

const createAndBuildStackAction = (selectedServices, serviceConfigurations) => {
  return {
    type: CREATE_AND_BUILD_STACK,
    promise: createAndBuildStack({ selectedServices, serviceConfigurations })
  }
};

export {
  CREATE_AND_BUILD_STACK,
  createAndBuildStackAction
};
