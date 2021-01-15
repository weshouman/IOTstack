import { Fragment } from 'react';
import ServiceUiControls from '../features/serviceUiControls';

const getConfigComponents = (configOptions) => {
  if (configOptions && typeof(configOptions) === 'object') {
    return Object.keys(configOptions).map((configName) => {
      switch(configName) {
        case "serviceName":
          return null;
          
        case "labeledPorts":
          return ServiceUiControls.PortConfig

          case "networks":
            if (configOptions[configName] === true) { // Check if set to true
              return ServiceUiControls.NetworkConfig
            } else {
              return null;
            }
        
          case "logging":
            if (configOptions[configName] === true) { // Check if set to true
              return ServiceUiControls.Logging
            } else {
              return null;
            }
              
        default:
          if (configOptions[configName]) { // Check if set
            return () => (<Fragment><div>Unknown Option {configName}</div></Fragment>);
          } else {
            return null;
          }
      }
    }).filter((ele) => {
      return ele !== null;
    });
  }

  return [Fragment];
};

export default getConfigComponents;
