import loadData from "../../assets/mock-data/ingestion.data";
import curateData from "../../assets/mock-data/flows.data";
import advancedData from "../../assets/mock-data/advanced-settings.data";

const loadAPI = (axiosMock) => {
  axiosMock.delete['mockImplementation']((url) => {
    switch (url) {
      case '/api/steps/ingestion/' + loadData.loads.data[0].name:
        return Promise.resolve(loadData.genericSuccess);
      default:
        return Promise.reject(new Error('not found'))
    }
  });
  axiosMock.post['mockImplementation']((url) => {
      switch (url) {
          case '/api/steps/ingestion/' + loadData.loads.data[0].name:
              return Promise.resolve({
                  "data": {},
                  "status": 200
              });
          default:
              return Promise.reject(new Error('not found'));
      }
  })
  return axiosMock.get['mockImplementation']((url) => {
    switch (url) {
      case '/api/flows':
        return Promise.resolve(loadData.flows);
      case '/api/steps/ingestion':
        return Promise.resolve(loadData.loads);
      case '/api/steps/ingestion/' + loadData.loads.data[0].name:
        return Promise.resolve(loadData.loadSettings);
      default:
        return Promise.reject(new Error('not found'));
    }
  })
};

const curateAPI = (axiosMock) => {
  axiosMock.delete['mockImplementation']((url) => {
    switch (url) {
      case '/api/steps/ingestion/' + loadData.loads.data[0].name:
        return Promise.resolve(loadData.genericSuccess);
      case '/api/steps/mapping/' + curateData.mappings.data[0].artifacts[0].name:
        return Promise.resolve(loadData.genericSuccess);
      default:
        return Promise.reject(new Error('not found'))
    }
  });
  axiosMock.post['mockImplementation']((url) => {
    switch (url) {
        case '/api/steps/mapping/' + curateData.mappings.data[0].artifacts[0].name:
            return Promise.resolve({
                "data": {},
                "status": 200
            });
        default:
            return Promise.reject(new Error('not found'));
    }
  });
  return axiosMock.get['mockImplementation']((url) => {
    switch (url) {
      case '/api/flows':
        return Promise.resolve(curateData.flows);
      case '/api/models/primaryEntityTypes':
        return Promise.resolve(curateData.primaryEntityTypes);
      case '/api/steps/ingestion':
        return Promise.resolve(loadData.loads);
      case '/api/steps/ingestion/' + loadData.loads.data[0].name:
        return Promise.resolve(loadData.loadSettings);    
      case '/api/steps/mapping':
        return Promise.resolve(curateData.mappings);
      case '/api/steps/mapping/' + curateData.mappings.data[0].artifacts[0].name:
        return Promise.resolve(curateData.mappingSettings);
      case '/api/artifacts/matching':
        return Promise.resolve(curateData.matchings);
      default:
        return Promise.reject(new Error('not found'));
    }
  })
};

const runAPI = (axiosMock) => {
  return axiosMock.get['mockImplementation']((url) => {
    switch (url) {
      case '/api/flows':
        return Promise.resolve(curateData.flowsWithMapping)
      case '/api/steps/ingestion':
        return Promise.resolve(curateData.loads);
      case '/api/steps/mapping':
        return Promise.resolve(curateData.mappings);
      case '/api/jobs/e4590649-8c4b-419c-b6a1-473069186592':
        return Promise.resolve(curateData.jobRespSuccess)
      default:
        return Promise.reject(new Error('not found'));
    }
  })
};

  const runCrudAPI = (axiosMock) => {
    // call Run API for the GET operations
    runAPI(axiosMock);
    axiosMock.post['mockImplementation']((url) => {
      switch (url) {
        case '/api/flows':
          return Promise.resolve({status: 201, data: {}});
        default:
          return Promise.reject(new Error('not found'));
      }
    })
    const updateURL = `/api/flows/${curateData.flowsWithMapping.data[0].name}`;
    axiosMock.put['mockImplementation']((url) => {
      switch (url) {
        case updateURL:
          return Promise.resolve({status: 200, data: {}});
        default:
          return Promise.reject(new Error('not found'));
      }
    })
    return axiosMock.delete['mockImplementation']((url) => {
      switch (url) {
        case updateURL:
          return Promise.resolve({status: 200, data: {}});
        default:
          return Promise.reject(new Error('not found'));
      }
    })
  };

  const runErrorsAPI = (axiosMock) => {
    return axiosMock.get['mockImplementation']((url) => {
      switch (url) {
        case '/api/flows':
          return Promise.resolve(curateData.flows)
        case '/api/steps/ingestion':
          return Promise.resolve(curateData.loads);
        case '/api/steps/mapping':
          return Promise.resolve(curateData.mappings);
        case '/api/jobs/350da405-c1e9-4fa7-8269-d9aefe3b4b9a':
          return Promise.resolve(curateData.jobRespFailedWithError)
        default:
          return Promise.reject(new Error('not found'));
      }
    })
  };

const runFailedAPI = (axiosMock) => {
  return axiosMock.get['mockImplementation']((url) => {
    switch (url) {
      case '/api/flows':
        return Promise.resolve(curateData.flows)
      case '/api/steps/ingestion':
        return Promise.resolve(curateData.loads);
      case '/api/steps/mapping':
        return Promise.resolve(curateData.mappings);
      case '/api/jobs/350da405-c1e9-4fa7-8269-d9aefe3b4b9a':
        return Promise.resolve(curateData.jobRespFailed)
      default:
        return Promise.reject(new Error('not found'));
    }
  })
};

const runXMLAPI = (axiosMock) => {
  return axiosMock.get['mockImplementation']((url) => {
    switch (url) {
      case '/api/flows':
        return Promise.resolve(curateData.flowsXML);
      case '/api/steps/ingestion':
        return Promise.resolve(curateData.loadsXML);
      case '/api/steps/mapping':
        return Promise.resolve(curateData.mappings);
      default:
        return Promise.reject(new Error('not found'));
    }
  })
};

const advancedAPI = (axiosMock) => {
  axiosMock.post.mockImplementationOnce(jest.fn(() =>
      Promise.resolve({ status: 200, data: {} })));
  return axiosMock.get['mockImplementation']((url) => {
      switch (url) {
          case '/api/steps/ingestion/AdvancedLoad':
              return Promise.resolve(advancedData.stepLoad);
          case '/api/steps/mapping/AdvancedMapping':
              return Promise.resolve(advancedData.stepMapping);
          default:
              return Promise.reject(new Error('not found'));
      }
  })
};

const mocks = {
  loadAPI: loadAPI,
  curateAPI: curateAPI,
  runAPI: runAPI,
  runCrudAPI: runCrudAPI,
  runErrorsAPI: runErrorsAPI,
  runFailedAPI: runFailedAPI,
  runXMLAPI: runXMLAPI,
  advancedAPI: advancedAPI,
};

export default mocks;
