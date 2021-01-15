const ADD_TO_SELECTED_SERVICES = 'ADD_TO_SELECTED_SERVICES';
const REMOVE_FROM_SELECTED_SERVICES = 'REMOVE_FROM_SELECTED_SERVICES';

const addSelectedService = (serviceName) => {
  return {
    type: ADD_TO_SELECTED_SERVICES,
    data: {
      serviceName
    }
  }
};

const removeSelectedService = (serviceName) => {
  return {
    type: REMOVE_FROM_SELECTED_SERVICES,
    data: {
      serviceName
    }
  }
};

export {
  ADD_TO_SELECTED_SERVICES,
  REMOVE_FROM_SELECTED_SERVICES,
  addSelectedService,
  removeSelectedService
};
