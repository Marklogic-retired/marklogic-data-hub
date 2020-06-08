import loadData from "./load.config";
import curateData from "./run.config";
import axiosMock from "axios";

const loadAPI = (axiosMock) => {
    axiosMock.delete['mockImplementation']((url) => {
      switch (url) {
        case '/api/steps/ingestion/' + loadData.loads.data[0].name:
          return Promise.resolve(loadData.genericSuccess);
        default:
          return Promise.reject(new Error('not found'))
      }
    });
    axiosMock.put['mockImplementation']((url) => {
        switch (url) {
            case '/api/steps/ingestion/' + loadData.loads.data[0].name + '/settings':
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
        case '/api/steps/ingestion/' + loadData.loads.data[0].name + '/settings':
          return Promise.resolve(loadData.loadSettings);
        default:
          return Promise.reject(new Error('not found'));
      }
    })
  };

  const curateAPI = (axiosMock) => {
    axiosMock.delete['mockImplementation']((url) => {
        switch (url) {
            case '/api/steps/mapping/' + curateData.mappings.data[0].artifacts[0].name:
                return Promise.resolve(loadData.genericSuccess);
            default:
                return Promise.reject(new Error('not found'))
        }
    });
    axiosMock.put['mockImplementation']((url) => {
        switch (url) {
            case '/api/steps/mapping/' + curateData.mappings.data[0].artifacts[0].name + '/settings':
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
          return Promise.resolve(curateData.flows)
        case '/api/models/primaryEntityTypes':
          return Promise.resolve(curateData.primaryEntityTypes);
        case '/api/steps/ingestion':
          return Promise.resolve(curateData.loads);
        case '/api/steps/ingestion/' + loadData.loads.data[0].name + '/settings':
          return Promise.resolve(curateData.loadSettings);
        case '/api/steps/mapping':
          return Promise.resolve(curateData.mappings);
        case '/api/steps/mapping/' + curateData.mappings.data[0].artifacts[0].name + '/settings':
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

  const mocks = {
    loadAPI: loadAPI,
    curateAPI: curateAPI,
    runAPI: runAPI,
    runErrorsAPI: runErrorsAPI,
    runFailedAPI: runFailedAPI,
    runXMLAPI: runXMLAPI,
  };

  export default mocks;
