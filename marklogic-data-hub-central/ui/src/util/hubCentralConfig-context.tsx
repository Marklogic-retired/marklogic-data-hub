import React, {useState, useContext} from "react";
import {UserContext} from "@util/user-context";
import {getHubCentralConfig, updateHubCentralConfig, primaryEntityTypes} from "@api/modeling";
import {defaultHubCentralConfig} from "@config/modeling.config";
import {themeColors} from "@config/themes.config";
import {defaultConceptIcon, defaultIcon} from "@config/explore.config";
import {getRelatedConcepts} from "@api/facets";

const defaultContextOptions = {
  hubCentralConfig: {},
  setHubCentralConfig: () => { },
  getHubCentralConfigFromServer: () => { },
  updateHubCentralConfigOnServer: () => { },
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
          const mockConcepts: any = await getRelatedConcepts("final");
          const updatedHubCentralConfig: any = defaultHubCentralConfig;
          const defaultNodesData = {
            color: themeColors.defaults.entityColor,
            icon: defaultIcon
          };
          responsePrimaryEntityTypes.data.forEach(model => {
            let isConcept = model.hasOwnProperty("conceptName");
            let nodeName = !isConcept ? model.entityName : model.conceptName;
            updatedHubCentralConfig["modeling"][!isConcept ? "entities" : "concepts"][nodeName] = Object.assign({}, defaultNodesData);
          });

          const defaultConceptsData = {
            color: themeColors.defaults.conceptColor,
            icon: defaultConceptIcon
          };

          mockConcepts.data.entitites.forEach(({relatedConcepts}) => relatedConcepts.forEach(({conceptClass, conceptIRI}) => {
            const semanticConcept = conceptIRI.split("/").pop();
            if (!updatedHubCentralConfig["modeling"]["concepts"][conceptClass]) {
              updatedHubCentralConfig["modeling"]["concepts"][conceptClass] = Object.assign({semanticConcepts: {}}, defaultConceptsData);
            }
            if (semanticConcept) {
              if (updatedHubCentralConfig["modeling"]["concepts"][conceptClass].semanticConcepts) {
                updatedHubCentralConfig["modeling"]["concepts"][conceptClass]["semanticConcepts"][semanticConcept] = Object.assign({}, defaultConceptsData);
              } else {
                updatedHubCentralConfig["modeling"]["concepts"][conceptClass].semanticConcepts = {[semanticConcept]: {...defaultConceptsData}};
              }
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