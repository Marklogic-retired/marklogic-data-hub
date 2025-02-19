import loadData from "../../assets/mock-data/curation/ingestion.data";
import curateData from "../../assets/mock-data/curation/flows.data";
import stepsData from "../../assets/mock-data/curation/steps.data";
import commonData from "../../assets/mock-data/curation/common.data";
import systemInfoData from "../../assets/mock-data/system-info.data";

const loadAPI = axiosMock => {
  axiosMock.delete["mockImplementation"](url => {
    switch (url) {
    case "/api/steps/ingestion/" + loadData.loads.data[0].name:
      return Promise.resolve(loadData.genericSuccess);
    default:
      return Promise.reject(new Error("not found"));
    }
  });
  axiosMock.post["mockImplementation"](url => {
    switch (url) {
    case "/api/steps/ingestion/" + loadData.loads.data[0].name:
      return Promise.resolve({
        "data": {},
        "status": 200,
      });
    default:
      return Promise.reject(new Error("not found"));
    }
  });
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/flows":
      return Promise.resolve(loadData.flows);
    case "/api/steps/ingestion":
      return Promise.resolve(loadData.loads);
    case "/api/steps/ingestion/" + loadData.loads.data[0].name:
      return Promise.resolve(loadData.loadSettings);
    case "/api/models":
      return Promise.resolve(loadData.models);
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const curateAPI = axiosMock => {
  axiosMock.delete["mockImplementation"](url => {
    switch (url) {
    case "/api/steps/ingestion/" + loadData.loads.data[0].name:
      return Promise.resolve(loadData.genericSuccess);
    case "/api/steps/mapping/" + curateData.mappings.data[0].artifacts[0].name:
      return Promise.resolve(loadData.genericSuccess);
    default:
      console.error("no DELETE defined: " + url);
      return Promise.reject(new Error("not found"));
    }
  });
  axiosMock.post["mockImplementation"](url => {
    switch (url) {
    case "/api/steps/mapping/" + curateData.mappings.data[0].artifacts[0].name:
      return Promise.resolve({
        "data": {},
        "status": 200,
      });
    default:
      console.error("no POST defined: " + url);
      return Promise.reject(new Error("not found"));
    }
  });
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/flows":
      return Promise.resolve(curateData.flows);
    case "/api/flows/testFlow/latestJobInfo":
      return Promise.resolve({status: 200, data: {}});
    case "/api/steps":
      return Promise.resolve(curateData.steps);
    case "/api/models/primaryEntityTypes":
      return Promise.resolve(curateData.primaryEntityTypes);
    case "/api/models/primaryEntityTypes?includeDrafts=true":
      return Promise.resolve(curateData.primaryEntityTypes);
    case "/api/steps/ingestion":
      return Promise.resolve(loadData.loads);
    case "/api/steps/ingestion/" + loadData.loads.data[0].name:
      return Promise.resolve(loadData.loadSettings);
    case "/api/steps/mapping":
      return Promise.resolve(curateData.mappings);
    case "/api/steps/mapping/" + curateData.mappings.data[0].artifacts[0].name:
      return Promise.resolve(curateData.mappingSettings);
    case "/api/artifacts/mapping/functions":
      return Promise.resolve({status: 200, data: {}});
    case "/api/artifacts/matching":
      return Promise.resolve(curateData.matchings);
    case "/api/steps/matching":
      return Promise.resolve(curateData.matchings);
    case "/api/steps/merging":
      return Promise.resolve({status: 200, data: []});
    case "/api/steps/custom":
      return Promise.resolve(curateData.customSteps);
    case "/api/steps/custom/customJSON":
      return Promise.resolve({status: 200, data: commonData.customData[0]});
    case "/api/artifacts/mapping/entity/Customer":
      return Promise.resolve({status: 200, data: {}});
    case "/api/steps/mapping/" + curateData.mappings.data[0].artifacts[0].name + "/uris?limit=20":
      return Promise.resolve({
        "data": ["/testdoc.xml"],
        "status": 200,
      });
    case `/api/steps/mapping/${curateData.mappings.data[0].artifacts[0].name}/doc?docUri=${encodeURIComponent(
      "/testdoc.xml",
    )}`:
      return Promise.resolve({
        status: 200,
        data: `<Order xmlns="https://www.w3schools.com/OrderNS">
  <RequiredDate>1996-09-23T13:27:06</RequiredDate>
  <ShipName>B's Beverages</ShipName>
  <OrderDetails xmlns:y="https://www.w3schools.com/OD">
    <OrderDetail xmlns:r="https://www.w3schools.com/Washington">
      <r:UnitPrice>26.6000</r:UnitPrice>
      <r:Discount>0</r:Discount>
      <r:Quantity>9</r:Quantity>
      <r:ProductID>64</r:ProductID>
    </OrderDetail>
    <OrderDetail xmlns:n="https://www.w3schools.com/California">
      <n:UnitPrice>27.2000</n:UnitPrice>
      <n:Discount>0</n:Discount>
      <n:Quantity>40</n:Quantity>
      <n:ProductID xmlns:k="https://www.w3schools.com/ProductNS">60</n:ProductID>
    </OrderDetail>
  </OrderDetails>
  <ShippedDate xmlns:l="https://www.w3schools.com/SD1">1996-08-28T19:15:26</ShippedDate>
  <ShippedDate xmlns:l="https://www.w3schools.com/SD2">1997-02-13T120:15:26</ShippedDate>
  <ShipCity>London</ShipCity>
  <CustomerID>BSBEV</CustomerID>
  <ShipVia xmlns="https://www.w3schools.com/SV">3</ShipVia>
  <ShipPostalCode>EC2 5NT</ShipPostalCode>
  <OrderID>10289</OrderID>
  <OrderDate>1996-08-26T07:24:10</OrderDate>
  <ShipRegion>null</ShipRegion>
  <ShipAddress>Fauntleroy Circus</ShipAddress>
  <ShipCountry>UK</ShipCountry>
  <EmployeeID>7</EmployeeID>
  <Freight>22.7700</Freight>
</Order>`,
      });
    default:
      console.error("no GET defined: " + url);
      return Promise.reject(new Error("not found"));
    }
  });
};

const runAPI = axiosMock => {
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/flows":
      return Promise.resolve(curateData.flows);
    case "/api/steps":
      return Promise.resolve(curateData.steps);
    case "/api/flows/testFlow/latestJobInfo":
      return Promise.resolve({});
    case "/api/steps/ingestion":
      return Promise.resolve(curateData.loads);
    case "/api/steps/mapping":
      return Promise.resolve(curateData.mappings);
    case "/api/jobs/e4590649-8c4b-419c-b6a1-473069186592":
      return Promise.resolve(curateData.jobRespSuccess);
    case "/api/jobs/8c69c502-e682-46ce-a0f4-6506ab527ab8":
      return Promise.resolve(curateData.jobRespRunning);
    case "/api/jobs/666f23f6-7fc7-492e-980f-8b2ba21a4b94":
      return Promise.resolve(curateData.jobRespCanceled);
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const runCrudAPI = axiosMock => {
  // call Run API for the GET operations
  runAPI(axiosMock);
  axiosMock.post["mockImplementation"](url => {
    switch (url) {
    case "/api/flows":
      return Promise.resolve({status: 201, data: {}});
    case `/api/flows/${curateData.flows.data[0].name}/steps`:
      return Promise.resolve({status: 200, data: {}});
    case `/api/flows/${curateData.flows.data[0].name}/steps/2`:
      return Promise.resolve({status: 200, data: {}});
    default:
      return Promise.reject(new Error("not found"));
    }
  });
  const updateURL = `/api/flows/${curateData.flows.data[0].name}`;
  axiosMock.put["mockImplementation"](url => {
    switch (url) {
    case updateURL:
      return Promise.resolve({status: 200, data: {}});
    default:
      return Promise.reject(new Error("not found"));
    }
  });
  return axiosMock.delete["mockImplementation"](url => {
    switch (url) {
    case updateURL:
      return Promise.resolve({status: 200, data: {}});
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const runAddStepAPI = axiosMock => {
  // call Run API for the GET operations
  runAPI(axiosMock);
  axiosMock.post["mockImplementation"](url => {
    switch (url) {
    case `/api/flows/${curateData.flows.data[0].name}/steps`:
      return Promise.resolve({status: 200, data: {}});
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

// For testing display of a flow missing a step (DHFPROD-6369)
const runMissingStep = axiosMock => {
  axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/flows":
      return Promise.reject({
        "response": {
          "data": {
            "code": 400,
            "message": "Error message",
          },
        },
      });
    case "/api/steps":
      return Promise.resolve(curateData.steps);
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const runErrorsAPI = axiosMock => {
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/flows":
      return Promise.resolve(curateData.flows);
    case "/api/steps":
      return Promise.resolve(curateData.steps);
    case "/api/steps/ingestion":
      return Promise.resolve(curateData.loads);
    case "/api/steps/mapping":
      return Promise.resolve(curateData.mappings);
    case "/api/jobs/350da405-c1e9-4fa7-8269-d9aefe3b4b9a":
      return Promise.resolve(curateData.jobRespFailedWithError);
    case "/api/flows/testFlow/latestJobInfo":
      return Promise.resolve({status: 200, data: {}});
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const runFailedAPI = axiosMock => {
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/flows":
      return Promise.resolve(curateData.flows);
    case "/api/steps":
      return Promise.resolve(curateData.steps);
    case "/api/steps/ingestion":
      return Promise.resolve(curateData.loads);
    case "/api/steps/mapping":
      return Promise.resolve(curateData.mappings);
    case "/api/jobs/350da405-c1e9-4fa7-8269-d9aefe3b4b9a":
      return Promise.resolve(curateData.jobRespFailed);
    case "/api/flows/testFlow/latestJobInfo":
      return Promise.resolve({status: 200, data: {}});
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const runXMLAPI = axiosMock => {
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/flows":
      return Promise.resolve(curateData.flowsXML);
    case "/api/flows/testFlow/latestJobInfo":
      return Promise.resolve(curateData.flowsXMLLatestJob);
    case "/api/steps":
      return Promise.resolve(curateData.steps);
    case "/api/steps/ingestion":
      return Promise.resolve(curateData.loadsXML);
    case "/api/steps/mapping":
      return Promise.resolve(curateData.mappings);
    case "/api/jobs/350da405-c1e9-4fa7-8269-d9aefe3b4b9a":
      return Promise.resolve(curateData.jobRespFailedWithError);
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const advancedAPI = axiosMock => {
  axiosMock.post["mockImplementationOnce"](jest.fn(() => Promise.resolve({status: 200, data: {}})));
  return axiosMock.get["mockImplementation"](url => {
    const targetEntityType = String(stepsData.stepMerging.targetEntityType);
    const targetEntityTitle = targetEntityType.substring(targetEntityType.lastIndexOf("/") + 1);
    const defaultCollectionsURL = `/api/steps/merging/defaultCollections/${encodeURIComponent(targetEntityTitle)}`;
    switch (url) {
    case "/api/steps/ingestion/AdvancedLoad":
      return Promise.resolve({status: 200, data: stepsData.stepLoad});
      //Settings for a custom ingestion step
    case "/api/steps/ingestion/CustomLoad":
      return Promise.resolve({
        data: {...stepsData.stepLoad, stepDefinitionName: "custom-ingestion", name: "CustomLoad"},
        status: 200,
      });
    case "/api/steps/mapping/AdvancedMapping":
      return Promise.resolve(stepsData.stepMapping);
    case "/api/steps/matching/AdvancedMatching":
      return Promise.resolve(stepsData.stepMatching);
    case "/api/steps/merging/AdvancedMerging":
      return Promise.resolve(stepsData.stepMerging);
    case defaultCollectionsURL:
      return Promise.resolve(stepsData.defaultTargetCollections);
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const systemInfoAPI = axiosMock => {
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/environment/systemInfo":
      return Promise.resolve({status: 200, data: systemInfoData.environment});
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const noResponseAPI = axiosMock => {
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/environment/systemInfo":
      return Promise.reject(new Error());
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const clearUserDataAPI = axiosMock => {
  return axiosMock.post["mockImplementation"](url => {
    switch (url) {
    case "/api/environment/clearUserData":
      return Promise.resolve({
        "data": {},
        "status": 200,
      });
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const getAllExcludeValuesList = axiosMock => {
  return axiosMock.get["mockImplementation"](url => {
    switch (url) {
    case "/api/steps/matching/exclusionList":
      return Promise.resolve({
        "data": {"name": "Preset List 1", "values": ["one", "two", "one", "two", "one", "two", "one", "two"]},
        "status": 200,
      });
    default:
      return Promise.reject(new Error("not found"));
    }
  });
};

const mocks = {
  loadAPI: loadAPI,
  curateAPI: curateAPI,
  runAPI: runAPI,
  runAddStepAPI: runAddStepAPI,
  runMissingStep: runMissingStep,
  runCrudAPI: runCrudAPI,
  runErrorsAPI: runErrorsAPI,
  runFailedAPI: runFailedAPI,
  runXMLAPI: runXMLAPI,
  advancedAPI: advancedAPI,
  systemInfoAPI: systemInfoAPI,
  noResponseAPI: noResponseAPI,
  clearUserDataAPI: clearUserDataAPI,
  getAllExcludeValuesList: getAllExcludeValuesList,
};

export default mocks;
