import React, {useState, useContext} from "react";
import {UserContext} from "@util/user-context";
import {getHubCentralConfig, updateHubCentralConfig, primaryEntityTypes} from "@api/modeling";
import {defaultHubCentralConfig} from "@config/modeling.config";
import {themeColors} from "@config/themes.config";
import {defaultIcon} from "@config/explore.config";
import {mockConceptsResponse} from "@api/concepts.data";

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
          const mockConcepts = mockConceptsResponse; //TODO: Change this line for the call to the endpoint when goes ready
          const updatedHubCentralConfig: any = defaultHubCentralConfig;
          const defaultNodesData = {
            color: themeColors.defaults.entityColor,
            icon: defaultIcon
          };
          responsePrimaryEntityTypes.data.forEach(model => {
            updatedHubCentralConfig["modeling"]["entities"][model.entityName] = Object.assign({}, defaultNodesData);
          });

          mockConcepts.entities.forEach(({relatedConcepts}) => relatedConcepts.forEach(({conceptClass, conceptId}) => {
            const semanticConcept = conceptId.split("/").pop();
            if (!updatedHubCentralConfig["modeling"]["concepts"][conceptClass]) {
              updatedHubCentralConfig["modeling"]["concepts"][conceptClass] = Object.assign({semanticConcepts: {}}, defaultNodesData);
            }
            if (semanticConcept) {
              updatedHubCentralConfig["modeling"]["concepts"][conceptClass].semanticConcepts[semanticConcept] = Object.assign({}, defaultNodesData);
            }
          }));
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
