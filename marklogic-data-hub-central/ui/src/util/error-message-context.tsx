import React, {useState} from "react";

type ErrorMessageContextInterface = {
  isVisible: boolean,
  message: JSX.Element|string,
}

interface IErrorMessageContextInterface {
  errorMessageOptions: ErrorMessageContextInterface,
  setErrorMessageOptions: (options: ErrorMessageContextInterface) => void;
}

const defaultErrorMessageOptions = {
  isVisible: false,
  message: "",
};

export const ErrorMessageContext = React.createContext<IErrorMessageContextInterface>({
  errorMessageOptions: defaultErrorMessageOptions,
  setErrorMessageOptions: () => { },
});

const ErrorMessageProvider: React.FC<{ children: any }> = ({children}) => {

  const [errorMessageOptions, setErrorMessageOptions] = useState<ErrorMessageContextInterface>({
    ...defaultErrorMessageOptions,
  });

  return (
    <ErrorMessageContext.Provider value={{
      errorMessageOptions,
      setErrorMessageOptions,
    }}>
      {children}
    </ErrorMessageContext.Provider>
  );
};

export default ErrorMessageProvider;


