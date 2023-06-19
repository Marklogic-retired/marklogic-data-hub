import React, {useContext} from "react";
import {UserContext} from "@util/user-context";
import {getHubCentralConfig, updateHubCentralConfig, primaryEntityTypes} from "@api/modeling";
import {defaultHubCentralConfig} from "@config/modeling.config";
import {themeColors} from "@config/themes.config";
import {defaultConceptIcon, defaultIcon} from "@config/explore.config";
import {getRelatedConcepts} from "@api/facets";

const defaultContextOptions = {
  hubCentralConfig: {},
};

const defaultContextFunctions = {
  getHubCentralConfigFromServer: async () => {},
  updateHubCentralConfigOnServer: async () => {},
  setHubCentralConfig: () => {},
};

interface HubCentralConfigContextInterface {
  hubCentralConfig: any;
}

type Actions =
  | {type: "setHubCentralConfig"; payload: any};

const reducer = (state: any, action: Actions) => {
  switch (action.type) {
  case "setHubCentralConfig":
    return {
      ...state,
      hubCentralConfig: action.payload,
    };
  default:
    return state;
  }
};

export const HubCentralConfigContext = React.createContext<HubCentralConfigContextInterface>({
  ...defaultContextOptions,
});

export const HubCentralConfigFunctionsContext = React.createContext<any>({
  ...defaultContextFunctions,
});

const HubCentralConfigProvider: React.FC<{children: any}> = ({children}) => {
  const {handleError} = useContext(UserContext);

  const [hubCentralConfig, dispatch] = React.useReducer(reducer,
    defaultContextOptions
  );

  const api = React.useMemo(() => {
    const getHubCentralConfigFromServer = async () => {
      try {
        const response = await getHubCentralConfig();
        if (response["status"] === 200) {
          if (response.data?.modeling) {
            dispatch({type: "setHubCentralConfig", payload: response.data});
          } else {
            const responsePrimaryEntityTypes = await primaryEntityTypes();
            const mockConcepts: any = await getRelatedConcepts("final");
            const updatedHubCentralConfig: any = defaultHubCentralConfig;
            const defaultNodesData = {
              color: themeColors.defaults.entityColor,
              icon: defaultIcon,
            };
            responsePrimaryEntityTypes.data.forEach(model => {
              let isConcept = model.hasOwnProperty("conceptName");
              let nodeName = !isConcept ? model.entityName : model.conceptName;
              updatedHubCentralConfig["modeling"][!isConcept ? "entities" : "concepts"][nodeName] = Object.assign(
                {},
                defaultNodesData,
              );
            });

            const defaultConceptsData = {
              color: themeColors.defaults.conceptColor,
              icon: defaultConceptIcon,
            };

            mockConcepts.data.entitites.forEach(({relatedConcepts}) =>
              relatedConcepts.forEach(({conceptClass, conceptIRI}) => {
                const semanticConcept = conceptIRI.split("/").pop();
                if (!updatedHubCentralConfig["modeling"]["concepts"][conceptClass]) {
                  updatedHubCentralConfig["modeling"]["concepts"][conceptClass] = Object.assign(
                    {semanticConcepts: {}},
                    defaultConceptsData,
                  );
                }
                if (semanticConcept) {
                  if (updatedHubCentralConfig["modeling"]["concepts"][conceptClass].semanticConcepts) {
                    updatedHubCentralConfig["modeling"]["concepts"][conceptClass]["semanticConcepts"][semanticConcept] =
                      Object.assign({}, defaultConceptsData);
                  } else {
                    updatedHubCentralConfig["modeling"]["concepts"][conceptClass].semanticConcepts = {
                      [semanticConcept]: {...defaultConceptsData},
                    };
                  }
                }
              }),
            );
            dispatch({type: "setHubCentralConfig", payload: updatedHubCentralConfig});
          }
        }
        return response;
      } catch (error) {
        handleError(error);
      }
    };

    const updateHubCentralConfigOnServer = async payload => {
      try {
        // might be better to have one call to the be here, updateHubCentralConfig should return the updated config
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
      dispatch({type: "setHubCentralConfig", payload: config});
    };

    return {
      getHubCentralConfigFromServer,
      updateHubCentralConfigOnServer,
      setHubCentralConfig
    };
  }, []);

  return (
    <HubCentralConfigFunctionsContext.Provider
      value={api}
    >
      <HubCentralConfigContext.Provider value={hubCentralConfig}>
        {children}
      </HubCentralConfigContext.Provider>

    </HubCentralConfigFunctionsContext.Provider>
  );
};

export default HubCentralConfigProvider;

export const useHubCentralConfig = () => useContext(HubCentralConfigContext);
export const useHubCentralConfigFunctions = () => useContext(HubCentralConfigFunctionsContext);
