import React, {useEffect, useState} from "react";
import {getViewSettings, setViewSettings} from "./user-context";

type LoadingContextInterface = {
  start: number,
  pageNumber: number,
  pageSize: number,
}

const defaultLoadingOptions = {
  start: 1,
  pageNumber: 1,
  pageSize: 10,
};

interface ILoadingContextInterface {
  loadingOptions: LoadingContextInterface;
  setPage: (pageNumber: number) => void;
  setPageSize: (current: number, pageSize: number) => void;
}

export const LoadingContext = React.createContext<ILoadingContextInterface>({
  loadingOptions: defaultLoadingOptions,
  setPage: () => { },
  setPageSize: () => { },
});

const LoadingProvider: React.FC<{ children: any }> = ({children}) => {

  const storage = getViewSettings();
  const storedPageNumber = storage?.load?.page;

  const [loadingOptions, setLoadingOptions] = useState<LoadingContextInterface>({
    ...defaultLoadingOptions,
    ...(storedPageNumber !== null ? {pageNumber: storedPageNumber} : {})
  });

  const setPage = (pageNumber) => {
    setLoadingOptions({
      ...loadingOptions,
      pageNumber: pageNumber,
    });
  };

  useEffect(() => {
    if (loadingOptions.pageNumber === undefined) {
      return;
    }
    const pageStorage = getViewSettings();
    const newStorage = {...pageStorage, load: {...pageStorage.load, page: loadingOptions.pageNumber}};
    setViewSettings(newStorage);
  }, [loadingOptions.pageNumber]);

  useEffect(() => {
    if (loadingOptions.pageNumber === undefined) {
      const pageStorage = getViewSettings();
      const storedPageNumber = pageStorage?.load?.page;
      if (storedPageNumber !== null) {
        setPage(storedPageNumber);
      }

      const newStorage = {...pageStorage, load: {...pageStorage.load, page: loadingOptions.pageNumber}};
      setViewSettings(newStorage);
    }
  }, [loadingOptions.pageNumber]);



  const setPageSize = (current: number, pageSize: number) => {
    setLoadingOptions({
      ...loadingOptions,
      start: 1,
      pageSize: pageSize,
    });
  };

  return (
    <LoadingContext.Provider value={{
      loadingOptions,
      setPage,
      setPageSize,
    }}>
      {children}
    </LoadingContext.Provider>
  );
};

export default LoadingProvider;


