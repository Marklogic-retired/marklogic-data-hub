import React, {useState, useContext} from "react";
import {UserContext} from "@util/user-context";
import {getHubCentralConfig, updateHubCentralConfig} from "@api/modeling";

const defaultContextOptions = {
  hubCentralConfig: {},
  setHubCentralConfig: () => {},
  getHubCentralConfigFromServer: () => {},
  updateHubCentralConfigOnServer: () => {},
};

interface HubCentralConfigContextInterface {
  hubCentralConfig: any;
  setHubCentralConfig: (config: any) => void;
  getHubCentralConfigFromServer: () => void;
  updateHubCentralConfigOnServer: (config: any) => void;
}

export const HubCentralConfigContext = React.createContext<HubCentralConfigContextInterface>({...defaultContextOptions});

const HubCentralConfigProvider: React.FC<{children: any}> = ({children}) => {
  const {handleError} = useContext(UserContext);
  const [hubCentralConfig, setConfig] = useState<HubCentralConfigContextInterface>(defaultContextOptions);

  const getHubCentralConfigFromServer = async () => {
    try {
      const response = await getHubCentralConfig();
      if (response["status"] === 200) {
        setConfig(response.data);
      }
      return response;
    } catch (error) {
      handleError(error);
    }
  };

  const updateHubCentralConfigOnServer = async (payload) => {
    try {
      const response = await updateHubCentralConfig(payload);
      if (response["status"] === 200) {
        await getHubCentralConfigFromServer();
      }
      return response;
    } catch (error) {
      handleError(error);
    }
  };

  const setHubCentralConfig = (config) => {
    setConfig(config);
  };

  return (
    <HubCentralConfigContext.Provider value={{
      hubCentralConfig,
      setHubCentralConfig,
      getHubCentralConfigFromServer,
      updateHubCentralConfigOnServer
    }}>
      {children}
    </HubCentralConfigContext.Provider>
  );
};

export default HubCentralConfigProvider;
