import { configureStore } from '@reduxjs/toolkit';
import thunk from 'redux-thunk';
import promiseMiddleware from './middlewares/promiseMiddleware';
import asyncDispatchMiddleware from './middlewares/asyncDispatchMiddleware';
import counterReducer from './counter';
import serviceTemplateList from './getServiceTemplateListReducer';
import serviceTemplates from './getServiceTemplatesReducer';
import networkTemplateList from './getNetworkTemplateListReducer';
import configServiceMetadata from './getServiceMetadataReducer';
import configServiceConfigOptions from './getServiceConfigOptionsReducer';
import selectedServices from './updateSelectedServicesReducer';
import hideServiceTags from './updateSelectedFilterTagsReducer';
import buildIssues from './getBuildIssuesReducer';
import buildStack from './buildStackReducer';
import buildHistory from './getBuildHistoryListReducer';
import scriptTemplates from './getScriptTemplatesReducer';


const middlewares = [thunk, promiseMiddleware, asyncDispatchMiddleware];

export default configureStore({
  reducer: {
    counter: counterReducer,
    serviceTemplateList: serviceTemplateList,
    networkTemplateList: networkTemplateList,
    serviceTemplates: serviceTemplates,
    configServiceMetadata: configServiceMetadata,
    configServiceConfigOptions: configServiceConfigOptions,
    selectedServices: selectedServices,
    buildHistory: buildHistory,
    hideServiceTags: hideServiceTags,
    buildIssues: buildIssues,
    buildStack: buildStack,
    scriptTemplates: scriptTemplates
  },
  middleware: middlewares
});
