import React, {useState, useContext} from "react";
import {UserContext} from "@util/user-context";
import {getHubCentralConfig, updateHubCentralConfig, primaryEntityTypes} from "@api/modeling";
import {defaultHubCentralConfig} from "@config/modeling.config";
import {themeColors} from "@config/themes.config";
import {defaultIcon} from "@config/explore.config";

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
  const [hubCentralConfig, setConfig] = useState<any>({});

  const getHubCentralConfigFromServer = async () => {
    try {
      const response = await getHubCentralConfig();
      if (response["status"] === 200) {
        if (response.data?.modeling) {
          setConfig(response.data);
        } else {
          const responsePrimaryEntityTypes = await primaryEntityTypes();
          const updatedHubCentralConfig: any = defaultHubCentralConfig;
          responsePrimaryEntityTypes.data.forEach(model => {
            updatedHubCentralConfig["modeling"]["entities"][model.entityName] = {
              color: themeColors.defaults.entityColor,
              icon: defaultIcon
            };
          });
          setConfig(updatedHubCentralConfig);
        }
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
