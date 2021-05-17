import React, {useState} from "react";

type MonitorContextInterface = {
    start: number,
    pageNumber: number,
    pageLength: number,
    pageSize: number,
    selectedFacets: any,
    maxRowsPerPage: number,
    sortOrder: any,
}

const defaultMonitorOptions = {
  start: 1,
  pageNumber: 1,
  pageLength: 20,
  pageSize: 20,
  selectedFacets: {},
  maxRowsPerPage: 100,
  sortOrder: []
};



interface IMonitorContextInterface {
    monitorOptions: MonitorContextInterface;
    monitorGreyedOptions: MonitorContextInterface;
    setMonitorPage: (pageNumber: number, totalDocuments: number) => void;
    setMonitorPageLength: (current: number, pageSize: number) => void;
    setMonitorSortOrder:(propertyName: string, sortOrder: any) => void;
    clearMonitorFacet: (constraint: string, val: string) => void;
    setAllMonitorFacets: (facets: any) => void;
    setAllMonitorGreyedOptions: (facets: any) => void;
    clearMonitorGreyFacet: (constraint: string, val: string) => void;
    clearMonitorConstraint: (constraint: string) => void;
    clearAllMonitorGreyFacets: () => void;
    clearAllMonitorFacets: () => void;
}

export const MonitorContext = React.createContext<IMonitorContextInterface>({
  monitorOptions: defaultMonitorOptions,
  monitorGreyedOptions: defaultMonitorOptions,
  setMonitorPage: () => { },
  setMonitorPageLength: () => { },
  setMonitorSortOrder: () => { },
  clearMonitorFacet: () => { },
  setAllMonitorFacets: () => { },
  setAllMonitorGreyedOptions: () => { },
  clearMonitorGreyFacet: () => { },
  clearMonitorConstraint: () => { },
  clearAllMonitorGreyFacets: () => { },
  clearAllMonitorFacets: () => { },
});

const MonitorProvider: React.FC<{ children: any }> = ({children}) => {

  const [monitorOptions, setMonitorOptions] = useState<MonitorContextInterface>(defaultMonitorOptions);
  const [monitorGreyedOptions, setMonitorGreyedOptions] = useState<MonitorContextInterface>(defaultMonitorOptions);

  const setMonitorPage = (pageNumber: number, totalDocuments: number) => {
    let pageLength = monitorOptions.pageSize;
    let start = pageNumber ;
    setMonitorOptions({
      ...monitorOptions,
      start,
      pageLength,
      pageNumber
    });
  };


  const setMonitorPageLength = (current: number, pageSize: number) => {
    setMonitorOptions({
      ...monitorOptions,
      start: current,
      pageNumber: current,
      pageLength: pageSize,
      pageSize,
    });
  };

  const setMonitorSortOrder = (propertyName: string, sortOrder: any) => {
    let sortingOrder: any = [];
    switch (sortOrder) {
    case "ascend":
      sortingOrder = [{
        propertyName: propertyName,
        sortDirection: "ascending"
      }];
      break;
    case "descend":
      sortingOrder = [{
        propertyName: propertyName,
        sortDirection: "descending"
      }];
      break;
    default:
      sortingOrder = [];
      break;
    }
    setMonitorOptions({
      ...monitorOptions,
      sortOrder: sortingOrder
    });
  };

  const clearMonitorFacet = (constraint: string, val: string) => {
    let facets = monitorOptions.selectedFacets;
    if (constraint !== 'startTime' && facets[constraint].length > 1) {
      facets[constraint] = facets[constraint].filter(option => option !== val);
    } else {
      delete facets[constraint];
    }
    setMonitorOptions({...monitorOptions, selectedFacets: facets});
    if (Object.entries(monitorGreyedOptions.selectedFacets).length > 0 && monitorGreyedOptions.selectedFacets.hasOwnProperty(constraint)) { clearMonitorGreyFacet(constraint, val); }
  };

  const setAllMonitorFacets = (facets: any) => {
    setMonitorOptions({
      ...monitorOptions,
      selectedFacets: facets,
      start: 1,
      pageNumber: 1,
      pageLength: monitorOptions.pageSize
    });
  };

  const setAllMonitorGreyedOptions = (facets: any) => {
    setMonitorGreyedOptions({
      ...monitorGreyedOptions,
      selectedFacets: facets,
      start: 1,
      pageNumber: 1,
      pageLength: monitorGreyedOptions.pageSize
    });
  };

  const clearMonitorGreyFacet = (constraint: string, val: string) => {
    let facets = monitorGreyedOptions.selectedFacets;
    if (facets[constraint].length > 1) {
      facets[constraint] = facets[constraint].filter(option => option !== val);
    } else {
      delete facets[constraint];
    }
    setMonitorGreyedOptions({...monitorGreyedOptions, selectedFacets: facets});
  };

  const clearMonitorConstraint = (constraint: string) => {
    let selectedFacet = monitorOptions.selectedFacets;
    let greyFacets = monitorGreyedOptions.selectedFacets;
    if (Object.entries(monitorGreyedOptions.selectedFacets).length > 0 && monitorGreyedOptions.selectedFacets.hasOwnProperty(constraint)) {
      delete greyFacets[constraint];
      setMonitorGreyedOptions({...monitorGreyedOptions, selectedFacets: greyFacets});
    }
    if (Object.entries(monitorOptions.selectedFacets).length > 0 && monitorOptions.selectedFacets.hasOwnProperty(constraint)) {
      delete selectedFacet[constraint];
      setMonitorOptions({...monitorOptions, selectedFacets: selectedFacet});
    }
  };

  const clearAllMonitorGreyFacets = () => {
    setMonitorGreyedOptions({
      ...monitorGreyedOptions,
      selectedFacets: {},
      start: 1,
      pageNumber: 1,
      pageLength: monitorGreyedOptions.pageSize
    });
  };

  const clearAllMonitorFacets = () => {
    setMonitorOptions({
      ...monitorOptions,
      selectedFacets: {},
      start: 1,
      pageNumber: 1,
      pageLength: monitorOptions.pageSize
    });
    clearAllMonitorGreyFacets();
  };


  return (
    <MonitorContext.Provider value={{
      monitorOptions,
      monitorGreyedOptions,
      setMonitorPage,
      setMonitorPageLength,
      setMonitorSortOrder,
      clearMonitorFacet,
      setAllMonitorFacets,
      setAllMonitorGreyedOptions,
      clearMonitorGreyFacet,
      clearMonitorConstraint,
      clearAllMonitorGreyFacets,
      clearAllMonitorFacets

    }}>
      {children}
    </MonitorContext.Provider>
  );
};

export default MonitorProvider;
