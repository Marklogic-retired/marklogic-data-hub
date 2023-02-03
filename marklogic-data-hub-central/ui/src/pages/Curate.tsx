import React, {useContext, useEffect, useState} from "react";
import {UserContext, getViewSettings} from "@util/user-context";

import {AuthoritiesContext} from "@util/authorities";
import EntityTiles from "@components/entities/entity-tiles";
import {ErrorMessageContext} from "@util/error-message-context";
import {MissingPagePermission} from "@config/messages.config";
import axios from "axios";
import styles from "./Curate.module.scss";
import tiles from "@config/tiles.config";
import {useHistory} from "react-router-dom";

const Curate: React.FC = () => {

  const storage = getViewSettings();


  const {handleError} = useContext(UserContext);
  const {setErrorMessageOptions} = useContext(ErrorMessageContext);
  // const [isLoading, setIsLoading] = useState(false);
  const [flows, setFlows] = useState<any[]>([]);
  const [entityModels, setEntityModels] = useState<any>({});
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const history = useHistory<any>();

  useEffect(() => {
    setIsFetching(true);
    Promise.all([getEntityModels(), getFlows()]).finally(() => {
      setIsFetching(false);
    });
  }, []);

  //Role based access
  const authorityService = useContext(AuthoritiesContext);
  const canReadMapping = authorityService.canReadMapping();
  const canWriteMapping = authorityService.canWriteMapping();
  const canReadMatchMerge = authorityService.canReadMatchMerge();
  const canWriteMatchMerge = authorityService.canWriteMatchMerge();
  const canWriteFlow = authorityService.canWriteFlow();
  const canReadCustom = authorityService.canReadCustom();
  const canWriteCustom = authorityService.canWriteCustom();
  const canAccessCurate = authorityService.canAccessCurate();


  useEffect(() => {
    const storedCurateArtifact = storage?.curate?.stepArtifact;
    const storedCurateModel = storage?.curate?.modelDefinition;
    const storedCurateType = storage?.curate?.entityType;

    if (storedCurateArtifact !== undefined && storedCurateModel !== undefined && storedCurateType !== undefined) {

      const stepDefinitionType = storedCurateArtifact["stepDefinitionType"];
      if (stepDefinitionType === "mapping") {
        history.push({pathname: "/tiles/curate/map"});
      } else if (stepDefinitionType === "MATCHING" || stepDefinitionType === "matching") {
        history.push({pathname: "/tiles/curate/match"});
      } else if (stepDefinitionType === "MERGING" || stepDefinitionType === "merging") {
        history.push({pathname: "/tiles/curate/merge"});
      }
    }
  }, []);

  const getEntityModels = async () => {
    try {
      let response = await axios.get(`/api/models/primaryEntityTypes`);
      if (response.status === 200) {
        let models:any = {};
        response.data.forEach(model => {
          // model has an entityTypeId property, perhaps that should be used instead of entityName?
          //Check if in the future we are going to use concepts here
          if (model.entityName) {
            models[model.entityName] = model;
          }
        });
        setEntityModels({...models});
      }
    } catch (error) {
      console.error("Error fetching entities", error);
      handleError(error);
    }
  };

  //GET all the flow artifacts
  const getFlows = async () => {
    try {
      let response = await axios.get("/api/flows");
      if (response.status === 200) {
        setFlows(response.data);
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error("Error getting flows", message);
      handleError(error);
    }
  };

  // POST mapping step to new flow
  const addStepToNew = async () => {
    try {
      // setIsLoading(true);

      //if (response.status === 200) {
      //   setIsLoading(false);
      //}
    } catch (error) {
      let message = error.response.data.message;
      console.error("Error while adding mapping step to new flow.", message);
      // setIsLoading(false);
      handleError(error);
    }
  };

  // POST step artifact to existing flow
  const addStepToFlow = async (stepArtifactName, flowName, stepType) => {
    let stepToAdd = {
      "stepName": stepArtifactName,
      "stepDefinitionType": stepType
    };
    try {
      // setIsLoading(true);
      let url = "/api/flows/" + flowName + "/steps";
      let body = stepToAdd;
      let response = await axios.post(url, body);
      if (response.status === 200) {
        // setIsLoading(false);
      }
    } catch (error) {
      let message = error.response.data.message;
      console.error("Error while adding step to flow.", message);
      // setIsLoading(false);
      setErrorMessageOptions({
        isVisible: true,
        message: `Error adding step "${stepArtifactName}" to flow "${flowName}".`
      });
      handleError(error);
    }
  };

  return (
    <div className={styles.curateContainer}>
      {
        canAccessCurate ?
          [
            <div className={styles.intro} key={"curate-intro"}>
              <p>{tiles.curate.intro}</p>
            </div>,
            <EntityTiles
              key={"curate-entity-tiles"}
              flows={flows}
              canReadMatchMerge={canReadMatchMerge}
              canWriteMatchMerge={canWriteMatchMerge}
              canWriteMapping={canWriteMapping}
              canReadMapping={canReadMapping}
              canReadCustom={canReadCustom}
              canWriteCustom={canWriteCustom}
              entityModels={entityModels}
              canWriteFlow={canWriteFlow}
              addStepToFlow={addStepToFlow}
              addStepToNew={addStepToNew}
              loading={isFetching}
            />
          ]
          :
          <p>{MissingPagePermission}</p>
      }
    </div>
  );

};

export default Curate;
