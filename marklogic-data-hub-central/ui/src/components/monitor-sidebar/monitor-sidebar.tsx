import React, {useContext, useEffect, useState} from "react";
import {facetParser} from "../../util/data-conversion";
import monitorPropertiesConfig from "../../config/monitoring.config";
import MonitorFacet from "../monitor-facet/monitor-facet";
import {MonitorContext} from "../../util/monitor-context";


interface Props {
    facets: any;
    facetRender: (facets: any) => void;
    checkFacetRender: (facets: any) => void;
}


export const MonitorSidebar:  (React.FC<Props>) = (props) => {
  const {
    monitorOptions,
    monitorGreyedOptions,
    setAllMonitorGreyedOptions,
    clearMonitorFacet,
    clearMonitorGreyFacet,
    clearMonitorConstraint
  } = useContext(MonitorContext);

  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(monitorOptions.selectedFacets);
  const [facetsList, setFacetsList] = useState<any[]>([]);


  useEffect(() => {
    if (props.facets) {
      let parsedFacets = facetParser(props.facets);
      const filteredFacets = monitorPropertiesConfig.map(property => {
        let facetValues = parsedFacets.find(facet => facet.facetName === property.facetName);
        return facetValues && {...property, ...facetValues};
      });
      setFacetsList(filteredFacets);

      if (Object.entries(monitorOptions.selectedFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for (let constraint in monitorOptions.selectedFacets) {
          let displayName = "";
          monitorOptions.selectedFacets[constraint].map(facet => {
            selectedFacets.push({constraint, facet, displayName});
          });
        }
        props.facetRender(selectedFacets);
      } else {
        props.facetRender([]);
        setAllSelectedFacets({});

      }
    }
  }, [props.facets]);

  useEffect(() => {
    if (Object.entries(monitorGreyedOptions.selectedFacets).length !== 0) {
      let checkedFacets: any[] = [];
      for (let constraint in monitorGreyedOptions.selectedFacets) {
        let displayName = "";
        monitorGreyedOptions.selectedFacets[constraint].map(facet => {
          checkedFacets.push({constraint, facet, displayName});
        });
      }
      props.checkFacetRender(checkedFacets);

    } else {
      if (Object.entries(monitorOptions.selectedFacets).length === 0) {
        //setAllSearchFacets({});
        setAllSelectedFacets({});
      } else {
        setAllSelectedFacets(monitorOptions.selectedFacets);
      }
      props.checkFacetRender([]);
    }
  }, [monitorGreyedOptions]);




  const updateSelectedFacets = (constraint: string, vals: string[], toDelete = false, toDeleteAll: boolean = false) => {
    let facets = {...allSelectedFacets};
    let greyFacets = {...monitorGreyedOptions.selectedFacets};
    let facetName = constraint;
    if (vals.length > 0) {
      facets = {
        ...facets,
        [facetName]: vals
      };
      greyFacets = {
        ...greyFacets,
        [facetName]: vals
      };
    } else {
      delete facets[facetName];
    }
    if (toDelete) {
      if (Object.entries(monitorOptions.selectedFacets).length > 0 && monitorOptions.selectedFacets.hasOwnProperty(constraint)) {
        clearMonitorFacet(constraint, vals[0]);
      } else if (Object.entries(monitorGreyedOptions.selectedFacets).length > 0 && monitorGreyedOptions.selectedFacets.hasOwnProperty(constraint)) {
        clearMonitorGreyFacet(constraint, vals[0]);
      }
    } else if (toDeleteAll) {
      clearMonitorConstraint(constraint);
    } else {
      setAllSelectedFacets(facets);
      setAllMonitorGreyedOptions(greyFacets);
    }
  };


  const addFacetValues = (constraint: string, vals: string[]) => {
    let newAllSelectedfacets = {...allSelectedFacets};
    let newFacetsList = [...facetsList];
    let index = newFacetsList.findIndex(facet => facet.facetName === constraint);

    if (index !== -1) {
      // add item to facetValues
      let additionalFacetVals = vals.map(item => {
        return {name: item, value: item};
      });

      newAllSelectedfacets = {
        ...newAllSelectedfacets,
        [constraint]: vals
      };
      for (let i = 0; i < additionalFacetVals.length; i++) {
        for (let j = 0; j < newFacetsList[index]["facetValues"].length; j++) {
          if (additionalFacetVals[i].name === newFacetsList[index]["facetValues"][j].name) {
            newFacetsList[index]["facetValues"].splice(j, 1);
            break;
          }
        }
        newFacetsList[index]["facetValues"].unshift(additionalFacetVals[i]);
      }
    }
    setFacetsList(newFacetsList);
    if (vals.length > 0) {
      newAllSelectedfacets = {
        ...newAllSelectedfacets,
        [constraint]: vals
      };
    } else {
      delete newAllSelectedfacets[constraint];
    }

    setAllSelectedFacets(newAllSelectedfacets);
    setAllMonitorGreyedOptions(newAllSelectedfacets);
  };



  return (
    <>
      {facetsList.map(facet => {
        return facet && (
          <MonitorFacet
            name={facet.facetName}
            displayName={facet.displayName}
            facetValues={facet.facetValues}
            key={facet.facetName}
            tooltip={facet.tooltip}
            updateSelectedFacets={updateSelectedFacets}
            addFacetValues={addFacetValues}
          />
        );
      })}
    </>);

};


export default MonitorSidebar;
