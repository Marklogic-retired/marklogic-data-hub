import React, {useState} from "react";

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

  const [loadingOptions, setLoadingOptions] = useState<LoadingContextInterface>(defaultLoadingOptions);

  const setPage = (pageNumber: number) => {
    setLoadingOptions({
      ...loadingOptions,
      pageNumber: pageNumber,
    });
  };


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


