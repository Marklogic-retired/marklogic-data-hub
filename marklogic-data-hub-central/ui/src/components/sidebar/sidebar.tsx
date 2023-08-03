import React, {useState, useEffect, useContext, useRef} from "react";
import dayjs from "dayjs";
import Select from "react-select";
import {Accordion, Form} from "react-bootstrap";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faInfoCircle, faSearch} from "@fortawesome/free-solid-svg-icons";
import {HCDateTimePicker, HCTooltip, HCInput, HCCheckbox} from "@components/common";
import Facet from "../facet/facet";
import {SearchContext} from "@util/search-context";
import {facetParser, deepCopy, entityFromJSON} from "@util/data-conversion";
import hubPropertiesConfig from "@config/hub-properties.config";
import tooltipsConfig from "@config/explorer-tooltips.config";
import styles from "./sidebar.module.scss";
import {getUserPreferences, updateUserPreferences} from "../../services/user-preferences";
import {UserContext} from "@util/user-context";
import reactSelectThemeConfig from "@config/react-select-theme.config";
import BaseEntitiesFacet from "../base-entities-facet/base-entities-facet";
import RelatedEntitiesFacet from "../related-entities-facet/related-entities-facet";
import RelatedConceptsFacets from "../related-concepts-facet/related-concepts-facet";
import {ExploreGraphViewToolTips} from "@config/tooltips.config";
import {HCDivider} from "@components/common";
import {graphSearchQuery, getEntities, searchResultsQuery} from "@api/queries";
import {exploreSidebar as exploreSidebarConfig} from "@config/explore.config";
import {getEnvironment} from "@util/environment";

const tooltips = tooltipsConfig.browseDocuments;
const {exploreSidebar} = tooltipsConfig;

interface Props {
  facets: any;
  selectedEntities: string[];
  entityDefArray: any[];
  facetRender: (facets: any) => void;
  checkFacetRender: (facets: any) => void;
  setDatabasePreferences: (option: string) => void;
  greyFacets: any;
  graphConceptsSearchSupported: boolean;
  setHubArtifactsVisibilityPreferences: any;
  hideDataHubArtifacts: boolean;
  cardView: boolean;
  graphView: boolean;
  setEntitySpecificPanel: (entity: any) => void;
  currentBaseEntities: any[];
  setCurrentBaseEntities: (entity: any[]) => void;
  currentRelatedConcepts: Map<string, any>;
  viewConcepts: boolean;
  setCurrentRelatedConcepts: (entity: Map<string, any>) => void;
  currentRelatedEntities: Map<string, any>;
  setCurrentRelatedEntities: (entity: Map<string, any>) => void;
  entityIndicatorData: any;
  entitiesWithRelatedConcepts: any;
  entityRelationships: any;
  isBackToResultsClicked?: boolean;
  renderTriggeredFromAnotherView?:boolean;
}
const Sidebar: React.FC<Props> = props => {
  const stagingDbName: string = getEnvironment().stagingDb ? getEnvironment().stagingDb : "Staging";
  const finalDbName: string = getEnvironment().finalDb ? getEnvironment().finalDb : "Final";
  const componentIsMounted = useRef(true);
  const entitiesArrayRef = useRef<any[]>();

  const {
    searchOptions,
    clearConstraint,
    clearFacet,
    clearGreyFacet,
    greyedOptions,
    setAllGreyedOptions,
    setDatasource,
    setSearchOptions,
    setQueryGreyedOptions,
    setRelatedEntityTypeIds,
    setConceptFilterTypeIds,
    setAllFilterTypeIds,
    setDatabaseAndDatasource,
  } = useContext(SearchContext);
  const {user, handleError} = useContext(UserContext);
  const [entityFacets, setEntityFacets] = useState<any[]>([]);
  const [hubFacets, setHubFacets] = useState<any[]>([]);
  const [maxQuantityOnFacets, setMaxQuantityOnFacets] = useState<number>(0);
  const [allSelectedFacets, setAllSelectedFacets] = useState<any>(searchOptions.selectedFacets);
  const [datePickerValue, setDatePickerValue] = useState<any[]>([null, null]);
  const [dateRangeValue, setDateRangeValue] = useState<string>();
  const [searchBox, setSearchBox] = useState(searchOptions.query);
  const [activeRelatedEntities, setActiveRelatedEntities] = useState(true);

  let integers = ["int", "integer", "short", "long"];
  let decimals = ["decimal", "double", "float"];
  const dateRangeOptions = ["Today", "This Week", "This Month", "Custom"];
  const [activeKey, setActiveKey] = useState<any[]>([]);
  const [userPreferences, setUserPreferences] = useState({});
  const [checkAllRelatedEntities, setCheckAllRelatedEntities] = useState(true);

  //Concept Facet related
  const [relatedConceptsValues, setRelatedConceptsValues] = useState({});
  const [checkAllRelatedConcepts, setCheckAllRelatedConcepts] = useState(true);

  useEffect(() => {
    let facets = {...greyedOptions.selectedFacets};
    if (dateRangeValue && !facets["createdOnRange"]) {
      setDateRangeValue("");
    }
  }, [greyedOptions, searchOptions]);

  useEffect(() => {
    let copyKey = deepCopy(activeKey);
    if (!activeRelatedEntities) {
      if (copyKey.includes("related-entities")) {
        copyKey.splice(copyKey.indexOf("related-entities"), 1);
      }
    } else {
      if (!copyKey.includes("related-entities")) {
        copyKey.push("related-entities");
      }
    }
    setActiveKey(copyKey);
  }, [activeRelatedEntities]);

  useEffect(() => {
    let relatedEntitiesList = new Map();
    let relatedConceptsList = new Map();

    props.currentBaseEntities.forEach(base => {
      let entityName = base["name"];
      props.entityRelationships[entityName].map(entityName => {
        const currentRelatedEntity = props.currentRelatedEntities.get(entityName);
        const relEntity = props.entityDefArray.find(entity => entity.name === entityName);
        relatedEntitiesList.set(entityName, {
          ...relEntity,
          checked: currentRelatedEntity?.checked || checkAllRelatedEntities,
        });
      });
    });

    const values = Array.from(relatedEntitiesList.values());
    const checkedValues = values.filter(({checked}) => checked);

    if (relatedConceptsValues.hasOwnProperty("facetValues")) {
      relatedConceptsValues["facetValues"].map(obj => {
        const currentRelatedConcept = props.currentRelatedConcepts.get(obj.name);
        relatedConceptsList.set(obj.name, {...obj, checked: currentRelatedConcept?.checked || checkAllRelatedConcepts});
      });
    }

    const conceptsValues = Array.from(relatedConceptsList.values());
    const checkedConceptsValues = conceptsValues.filter(({checked}) => checked);
    setAllFilterTypeIds(
      checkedValues.map(function (i) {
        return i.name;
      }),
      checkedConceptsValues.map(function (i) {
        return i.value;
      }),
    );
    props.setCurrentRelatedConcepts(relatedConceptsList);
    props.setCurrentRelatedEntities(relatedEntitiesList);
  }, [props.currentBaseEntities, relatedConceptsValues]);

  useEffect(() => {
    getByDefaultCheckedFacetsLS();
  }, [props.currentBaseEntities]);

  const onSettingRelatedEntitiesCheckedList = list => {
    setCheckAllRelatedEntities(list.length === props.currentRelatedEntities.size);
  };

  const onSettingRelatedConceptsCheckedList = list => {
    setCheckAllRelatedConcepts(list.length === props.currentRelatedConcepts.size);
  };

  const onCheckAll = (checked: boolean) => {
    let relatedEntitiesList = new Map();
    Array.from(props.currentRelatedEntities.values()).forEach(entity => {
      relatedEntitiesList.set(entity.name, {...entity, checked: checked});
    });
    const values = Array.from(relatedEntitiesList.values());
    const checkedValues = values.filter(({checked}) => checked);
    setRelatedEntityTypeIds(
      checkedValues.map(function (i) {
        return i.name;
      }),
    );
    props.setCurrentRelatedEntities(relatedEntitiesList);
  };

  const onCheckAllChanges = ({target}) => {
    const {checked} = target;
    setCheckAllRelatedEntities(checked);
    onCheckAll(checked);
  };

  const onCheckAllRelatedEntities = event => {
    if (event.key === "Enter" && activeRelatedEntities) {
      const {target} = event;
      const {checked} = target;
      setCheckAllRelatedEntities(!checked);
      onCheckAll(!checked);
    }
  };

  const onCheckAllRelatedConcepts = checked => {
    let relatedConceptsList = new Map();
    if (relatedConceptsValues.hasOwnProperty("facetValues")) {
      relatedConceptsValues["facetValues"].map(obj => {
        relatedConceptsList.set(obj.name, {...obj, checked: checked});
      });
    }
    const values = Array.from(relatedConceptsList.values());
    const checkedValues = values.filter(({checked}) => checked);
    if (checkedValues.length) {
      setConceptFilterTypeIds(
        checkedValues.map(function (i) {
          return i.value;
        }),
      );
    } else {
      setConceptFilterTypeIds(["#"]);
    }
    props.setCurrentRelatedConcepts(relatedConceptsList);
  };

  const onCheckAllRelatedConceptsKeyDown = event => {
    if (event.key === "Enter") {
      const {target} = event;
      const {checked} = target;
      setCheckAllRelatedConcepts(!checked);
      onCheckAllRelatedConcepts(!checked);
    }
  };

  const onCheckAllRelatedConceptsClick = event => {
    const {target} = event;
    const {checked} = target;
    setCheckAllRelatedConcepts(checked);
    onCheckAllRelatedConcepts(checked);
  };

  useEffect(() => {
    if (props.facets) {
      let {defaultActiveKeys} = exploreSidebarConfig;
      setActiveKey(defaultActiveKeys);
      for (let i in hubFacets) {
        if (
          searchOptions.selectedFacets.hasOwnProperty(hubFacets[i] && hubFacets[i].facetName) ||
          greyedOptions.selectedFacets.hasOwnProperty(hubFacets[i] && hubFacets[i].facetName)
        ) {
          setActiveKey(defaultActiveKeys);
        }
      }
      let tmpMaxQuantityOnFacets: number = 0;
      const parsedFacets = facetParser(props.facets);
      const filteredHubFacets = hubPropertiesConfig.map(hubFacet => {
        let hubFacetValues = parsedFacets.find(facet => facet.facetName === hubFacet.facetName);
        tmpMaxQuantityOnFacets =
          hubFacetValues && hubFacetValues.hasOwnProperty("facetValues")
            ? hubFacetValues.facetValues.reduce(
              (previousValue, {count}) => (previousValue < count ? count : previousValue),
              tmpMaxQuantityOnFacets,
            )
            : tmpMaxQuantityOnFacets;
        return hubFacetValues && {...hubFacet, ...hubFacetValues};
      });

      setMaxQuantityOnFacets(tmpMaxQuantityOnFacets);
      setHubFacets(filteredHubFacets);

      let selectedHubFacets: any = [];
      for (let facet in searchOptions.selectedFacets) {
        let hubFacetValue = filteredHubFacets.find(hubFacet => hubFacet && hubFacet.facetName === facet);
        if (hubFacetValue) {
          selectedHubFacets.push(hubFacetValue);
        }
      }

      if (selectedHubFacets.length) {
        initializeFacetPreferences();
      } else {
        searchOptions.entityTypeIds?.length && activeRelatedEntities && activeKey.includes("related-entities")
          ? setActiveKey([...defaultActiveKeys, "related-entities"])
          : setActiveKey(["database", "hubProperties", "baseEntities"]);
      }

      let entityFacets: any[] = [];
      let relatedConceptsObj: any = [],
        result = 0; // eslint-disable-line @typescript-eslint/no-unused-vars
      if (searchOptions.entityTypeIds?.length) {
        let newEntityFacets = parsedFacets.filter(
          facet => facet.facetName.split(".")[0] === searchOptions.entityTypeIds[0],
        );
        const entityDef = props.entityDefArray.find(entity => entity.name === searchOptions.entityTypeIds[0]);

        if (newEntityFacets) {
          for (let i in newEntityFacets) {
            newEntityFacets[i].referenceType = "path";
            newEntityFacets[i].entityTypeId =
              entityDef?.info["baseUri"] +
              entityDef?.info["title"] +
              "-" +
              entityDef?.info["version"] +
              "/" +
              entityDef?.name;
            newEntityFacets[i].propertyPath = newEntityFacets[i]["facetName"].substring(
              newEntityFacets[i]["facetName"].indexOf(".") + 1,
            );
          }
        }
        entityFacets = newEntityFacets ? newEntityFacets.filter(item => item !== false) : [];
        setEntityFacets(entityFacets);

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        result = props.entitiesWithRelatedConcepts?.entitites?.forEach(obj => {
          if (searchOptions.entityTypeIds.includes(obj.entityType.split("/").pop())) {
            for (let conceptIdx in obj.relatedConcepts) {
              relatedConceptsObj.push(obj.relatedConcepts[conceptIdx]);
            }
          }
        });

        if (relatedConceptsObj && relatedConceptsObj.length) {
          if (activeKey.includes("related-concepts")) {
            setActiveKey([...defaultActiveKeys, "related-concepts"]);
          }
          if (relatedConceptsObj.length === searchOptions.selectedFacets?.RelatedConcepts?.stringValues?.length) {
            setCheckAllRelatedConcepts(true);
          }
        }
        let conceptFacets = relatedConceptsObj.map(concept => {
          let facetName = concept.conceptIRI.split("/").pop();
          return {
            max: 1,
            name: facetName,
            value: concept.conceptIRI,
            count: concept.count,
          };
        });
        let finalConcepts: any = {
          facetName: "RelatedConcepts",
          type: "concept",
          facetValues: conceptFacets,
          entityTypeId: searchOptions.entityTypeIds,
        };
        setRelatedConceptsValues(finalConcepts);
      }

      if (Object.entries(searchOptions.selectedFacets).length !== 0) {
        let selectedFacets: any[] = [];
        for (let constraint in searchOptions.selectedFacets) {
          let displayName = "";
          let entityFacet = entityFacets && entityFacets.find(facet => facet.facetName === constraint);
          if (entityFacet && entityFacet.propertyPath !== constraint) {
            displayName = entityFacet.propertyPath;
          }
          if (constraint === "createdOnRange") {
            if (searchOptions.selectedFacets && searchOptions.selectedFacets[constraint]) {
              setDateRangeValue(searchOptions.selectedFacets[constraint]["stringValues"][0]);
            }
            selectedFacets.push({constraint, facet: searchOptions.selectedFacets[constraint], displayName});
          } else {
            setDateRangeValue("select time");
            let datatype = searchOptions.selectedFacets[constraint].dataType;
            if (datatype === "xs:string" || datatype === "string") {
              searchOptions.selectedFacets[constraint]["stringValues"].forEach(facet => {
                selectedFacets.push({constraint, facet, displayName});
              });
            } else if (integers.includes(datatype) || decimals.includes(datatype)) {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            } else if (datatype === "xs:date" || datatype === "date") {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            } else if (datatype === "xs:dateTime" || datatype === "dateTime") {
              let rangeValues = searchOptions.selectedFacets[constraint].rangeValues;
              selectedFacets.push({constraint, rangeValues, displayName});
            }
          }
          props.facetRender(selectedFacets);
        }
        if (!selectedFacets.some(item => item.constraint === "createdOnRange")) {
          setDatePickerValue([null, null]);
        }
      } else {
        setDateRangeValue("select time");
        props.facetRender([]);
        setAllSelectedFacets({});
        setDatePickerValue([null, null]);
      }
    }
  }, [searchOptions.entityTypeIds, props.facets]);

  useEffect(() => {
    if (Object.entries(greyedOptions.selectedFacets).length !== 0) {
      let checkedFacets: any[] = [];
      for (let constraint in greyedOptions.selectedFacets) {
        let displayName = "";
        let entityFacet = entityFacets && entityFacets.find(facet => facet.facetName === constraint);
        if (entityFacet && entityFacet.propertyPath !== constraint) {
          displayName = entityFacet.propertyPath;
        }
        if (constraint === "createdOnRange") {
          checkedFacets.push({constraint, facet: greyedOptions.selectedFacets[constraint], displayName});
        } else {
          let datatype = greyedOptions.selectedFacets[constraint].dataType;
          if (datatype === "xs:string" || datatype === "string" || datatype === "concept") {
            greyedOptions.selectedFacets[constraint]["stringValues"].map(facet => {
              checkedFacets.push({constraint, facet, displayName});
            });
          } else if (integers.includes(datatype) || decimals.includes(datatype)) {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          } else if (datatype === "xs:date" || datatype === "date") {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          } else if (datatype === "xs:dateTime" || datatype === "dateTime") {
            let rangeValues = greyedOptions.selectedFacets[constraint].rangeValues;
            checkedFacets.push({constraint, rangeValues, displayName});
          }
        }
        props.checkFacetRender(checkedFacets);
      }
      if (!checkedFacets.some(item => item.constraint === "createdOnRange")) {
        setDatePickerValue([null, null]);
      }
    } else {
      if (Object.entries(searchOptions.selectedFacets).length === 0) {
        //setAllSearchFacets({});
        setAllSelectedFacets({});
        setDateRangeValue("select time");
      } else {
        setAllSelectedFacets(searchOptions.selectedFacets);
        if (!Object.keys(searchOptions.selectedFacets).some(item => item === "createdOnRange")) {
          setDateRangeValue("select time");
        }
      }
      props.checkFacetRender([]);
    }
  }, [greyedOptions]);

  //To handle default views for first-time user experience
  useEffect(() => {
    getEntities()
      .then(res => {
        entitiesArrayRef.current! = [...entityFromJSON(res.data).map(entity => entity.info.title)];
        checkDataInDatabase("final").then(countEntityFinalCount => {
          //By Default entities datasource and final database is selected
          if (countEntityFinalCount === 0 && !props.isBackToResultsClicked) {
            checkDataInDatabase("staging").then(countEntityStagingCount => {
              if (countEntityStagingCount > 0) {
                //Setting the staging database if there is no data in final database
                props.setDatabasePreferences("staging");
              } else {
                //Setting the All Data datasource with staging database at end
                checkDataInDatabase("final", "all-data").then(countAllDataFinalCount => {
                  if (!props.renderTriggeredFromAnotherView) {
                    if (countAllDataFinalCount === 0) {
                      //Setting the staging database if there is no data in final database
                      setDatabaseAndDatasource({database: "staging", datasource: "all-data"});
                    } else {
                      setDatasourcePreferences("all-data");
                    }
                  }
                });
              }
            });
          }
        });
      })
      .catch(error => {
        handleError(error);
      });
  }, []);

  const checkDataInDatabase = async (database: string, allData?: string) => {
    try {
      let payload = {
        "database": database,
        "data": {
          "query": {
            "searchText": "",
            "entityTypeIds": entitiesArrayRef.current!,
            "selectedFacets": searchOptions.selectedFacets,
          },
          "start": 0,
          "pageLength": 1,
        },
      };

      let response;
      if (allData) {
        payload.data.query["entityTypeIds"] = [];
        payload.data.query["hideHubArtifacts"] = true;

        response = await searchResultsQuery(payload);
      } else {
        payload.data.query["relatedEntityTypeIds"] = searchOptions.relatedEntityTypeIds;
        if (searchOptions.conceptFilterTypeIds.length) {
          payload["data"]["query"]["conceptsFilterTypeIds"] = searchOptions.conceptFilterTypeIds;
        }
        response = await graphSearchQuery(payload);
      }
      if (componentIsMounted.current && response.data) {
        return response.data.total;
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getByDefaultCheckedFacetsLS = () => {
    const defaultPreferences = getUserPreferences(user.name);

    if (defaultPreferences !== null) {
      let parsedPreferences = JSON.parse(defaultPreferences);
      parsedPreferences?.preselectedFacets && setAllGreyedOptions(parsedPreferences.preselectedFacets);
    }
  };

  const getFinalDbLabel = () => {
    let finalDbLabel = finalDbName;
    if (finalDbLabel && finalDbLabel.toLowerCase().includes("final")) finalDbLabel = "Final";
    return finalDbLabel;
  };

  const getStagingDbLabel = () => {
    let stagingDbLabel = stagingDbName;
    if (stagingDbLabel.toLowerCase().includes("staging")) stagingDbLabel = "Staging";
    return stagingDbLabel;
  };

  const deleteGreyFacetLS = (facetName, valueKey, val) => {
    const defaultPreferences = getUserPreferences(user.name);

    if (defaultPreferences !== null) {
      let oldOptions = JSON.parse(defaultPreferences);
      let greyFacetsLS = oldOptions?.preselectedFacets;
      let newArrayLS = greyFacetsLS[facetName] ? greyFacetsLS[facetName][valueKey]?.filter(x => x !== val) : false;

      if (newArrayLS !== false) {
        greyFacetsLS[facetName][valueKey] = newArrayLS;

        let newOptions = {
          ...oldOptions,
          preselectedFacets: greyFacetsLS,
        };
        updateUserPreferences(user.name, newOptions);
      }
    }
  };

  const updateSelectedFacets = (
    constraint: string,
    vals: string[],
    datatype: string,
    isNested: boolean,
    toDelete = false,
    toDeleteAll: boolean = false,
  ) => {
    let facets = {...allSelectedFacets};
    let greyFacets = {...greyedOptions.selectedFacets};
    let type = "";
    let valueKey = "";
    let facetName = constraint;

    switch (datatype) {
    case "xs:string":
    case "concept":
    case "collection": {
      type = "xs:string";
      valueKey = "stringValues";
      break;
    }
    case "xs:integer": {
      type = "xs:integer";
      valueKey = "rangeValues";
      break;
    }
    case "xs:decimal": {
      type = "xs:decimal";
      valueKey = "rangeValues";
      break;
    }
    default:
      break;
    }

    if (vals.length > 0) {
      facets = {
        ...facets,
        [facetName]: {
          dataType: type,
          [valueKey]: vals,
        },
      };
      greyFacets = {
        ...greyFacets,
        [facetName]: {
          dataType: type,
          [valueKey]: vals,
        },
      };
    } else {
      delete facets[facetName];
    }
    if (toDelete) {
      if (
        Object.entries(searchOptions.selectedFacets).length > 0 &&
        searchOptions.selectedFacets.hasOwnProperty(constraint)
      ) {
        clearFacet(constraint, vals[0]);
      } else if (
        Object.entries(greyedOptions.selectedFacets).length > 0 &&
        greyedOptions.selectedFacets.hasOwnProperty(constraint)
      ) {
        clearGreyFacet(constraint, vals[0]);
        facetName !== "RelatedConcepts" && deleteGreyFacetLS(facetName, valueKey, vals[0]);
      }
      if (facetName === "RelatedConcepts" && checkAllRelatedConcepts) {
        setCheckAllRelatedConcepts(false);
      }
    } else if (toDeleteAll) {
      clearConstraint(constraint);
    } else {
      setAllSelectedFacets(facets);
      setAllGreyedOptions(greyFacets);
      if (facetName === "RelatedConcepts") {
        if (facets[facetName][valueKey].length === relatedConceptsValues["facetValues"].length) {
          setCheckAllRelatedConcepts(true);
        }
      }
      savingCheckedFacetsLS(facets);
    }
  };

  const savingCheckedFacetsLS = (facets: any) => {
    let userPreferences = getUserPreferences(user.name);
    if (userPreferences) {
      let oldOptions = JSON.parse(userPreferences);
      let newOptions = {
        ...oldOptions,
        preselectedFacets: facets,
      };
      updateUserPreferences(user.name, newOptions);
    }
  };

  const addFacetValues = (constraint: string, vals: string[], dataType: string, facetCategory: string) => {
    let newAllSelectedfacets = {...allSelectedFacets};
    let valueKey = "stringValues";
    // TODO add support for non string facets

    if (dataType === "xs:string") {
      valueKey = "stringValues";
    }

    if (facetCategory === "entity") {
      let newEntityFacets = [...entityFacets];
      let index = newEntityFacets.findIndex(facet => facet.facetName === constraint);

      if (index !== -1) {
        // add item to facetValues
        let additionalFacetVals = vals.map(item => {
          return {name: item, count: 0, value: item};
        });
        // facet value doesn't exist
        newAllSelectedfacets = {
          ...newAllSelectedfacets,
          [constraint]: {
            dataType,
            [valueKey]: vals,
          },
        };
        for (let i = 0; i < additionalFacetVals.length; i++) {
          for (let j = 0; j < newEntityFacets[index]["facetValues"].length; j++) {
            if (additionalFacetVals[i].name === newEntityFacets[index]["facetValues"][j].name) {
              newEntityFacets[index]["facetValues"].splice(j, 1);
              break;
            }
          }
          newEntityFacets[index]["facetValues"].unshift(additionalFacetVals[i]);
        }
      }
      setEntityFacets(newEntityFacets);
    } else if (facetCategory === "hub") {
      let newHubFacets = [...hubFacets];
      let index = newHubFacets.findIndex(facet => facet.facetName === constraint);

      if (index !== -1) {
        // add item to facetValues
        let additionalFacetVals = vals.map(item => {
          return {name: item, count: 0, value: item};
        });

        newAllSelectedfacets = {
          ...newAllSelectedfacets,
          [constraint]: {
            dataType,
            [valueKey]: vals,
          },
        };
        for (let i = 0; i < additionalFacetVals.length; i++) {
          for (let j = 0; j < newHubFacets[index]["facetValues"].length; j++) {
            if (additionalFacetVals[i].name === newHubFacets[index]["facetValues"][j].name) {
              newHubFacets[index]["facetValues"].splice(j, 1);
              break;
            }
          }
          newHubFacets[index]["facetValues"].unshift(additionalFacetVals[i]);
        }
      }
      setHubFacets(newHubFacets);
    }
    let type = "";
    switch (dataType) {
    case "xs:string":
    case "collection": {
      type = "xs:string";
      valueKey = "stringValues";
      break;
    }
    case "xs:integer": {
      type = "xs:integer";
      valueKey = "rangeValues";
      break;
    }
    case "xs:decimal": {
      type = "xs:decimal";
      valueKey = "rangeValues";
      break;
    }
    default:
      break;
    }
    if (vals.length > 0) {
      newAllSelectedfacets = {
        ...newAllSelectedfacets,
        [constraint]: {
          dataType: type,
          [valueKey]: vals,
        },
      };
    } else {
      delete newAllSelectedfacets[constraint];
    }

    setAllSelectedFacets(newAllSelectedfacets);
    setAllGreyedOptions(newAllSelectedfacets);
  };

  const saveOptionSelectDateLS = (dateObject: any) => {
    let userPreferences = getUserPreferences(user.name);
    if (userPreferences) {
      let oldOptions = JSON.parse(userPreferences);
      let newOptions = {
        ...oldOptions,
        preselectedFacets: {...oldOptions.preselectedFacets, createdOnRange: dateObject},
      };
      updateUserPreferences(user.name, newOptions);
    }
  };

  const handleOptionSelect = (option: any) => {
    setDateRangeValue(option.value);
    if (option.value === "Custom") {
      setDatePickerValue([null, null]);
      return;
    }
    let updateFacets = {...allSelectedFacets};
    let createdOnRangeVal = {
      dataType: "date",
      stringValues: [option.value, -1 * new Date().getTimezoneOffset()],
      rangeValues: {lowerBound: "", upperBound: ""},
    };
    updateFacets = {...updateFacets, createdOnRange: createdOnRangeVal};
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
    saveOptionSelectDateLS(createdOnRangeVal);
  };

  const timeWindow = selectedDateRangeValue => {
    let date = "";
    if (selectedDateRangeValue === "This Week") {
      const startOfWeek = dayjs().startOf("week").format("MMM DD");
      const endOfWeek = dayjs().format("MMM DD");
      date = "(" + startOfWeek + " - " + endOfWeek + ")";
    }

    if (selectedDateRangeValue === "This Month") {
      const startOfMonth = dayjs().startOf("month").format("MMM DD");
      const endOfMonth = dayjs().format("MMM DD");
      date = "(" + startOfMonth + " - " + endOfMonth + ")";
    }

    return date;
  };

  const onDateChange = (startDate, endDate) => {
    const dateArray = [startDate, endDate];
    let updateFacets = {...allSelectedFacets};
    let createdOnRangeAux, dateArrayAux;

    if (endDate && endDate.isValid()) {
      createdOnRangeAux = {
        dataType: "date",
        stringValues: ["Custom", -1 * new Date().getTimezoneOffset()],
        rangeValues: {lowerBound: dayjs(dateArray[0]).format(), upperBound: dayjs(dateArray[1]).format()},
      };
      updateFacets = {...updateFacets, createdOnRange: createdOnRangeAux};
      dateArrayAux = [dayjs(dateArray[0]), dayjs(dateArray[1])];
      setDatePickerValue(dateArrayAux);
      saveOptionSelectDateLS(createdOnRangeAux /*, dateArrayAux*/);
    } else {
      delete updateFacets.createdOnRange;
      setDatePickerValue([null, null]);
    }
    setAllSelectedFacets(updateFacets);
    setAllGreyedOptions(updateFacets);
  };

  const setActiveAccordion = key => {
    const tmpActiveKeys = [...activeKey];
    const index = tmpActiveKeys.indexOf(key);
    index !== -1 ? tmpActiveKeys.splice(index, 1) : tmpActiveKeys.push(key);
    setActiveKey(tmpActiveKeys);
    handleFacetPreferences(tmpActiveKeys);
  };

  const setDatasourcePreferences = datasource => {
    setDatasource(datasource);
  };

  const initializeFacetPreferences = () => {
    let defaultPreferences = getUserPreferences(user.name);
    if (defaultPreferences !== null) {
      let parsedPreferences = JSON.parse(defaultPreferences);
      if (parsedPreferences.activeFacets) {
        setUserPreferences({...parsedPreferences});
      }
    }
  };

  const handleFacetPreferences = key => {
    let options = {
      ...userPreferences,
      activeFacets: key,
    };
    updateUserPreferences(user.name, options);
  };

  const [isTooltipVisible, setTooltipVisible] = useState({
    baseEntities: false,
    relatedEntities: false,
    relatedConcepts: false,
    finalDb: false,
    stagingDb: false,
    createdOn: false,
    sourceName: false,
    sourceType: false,
    collection: false,
    flow: false,
    step: false,
    artifacts: false,
  });

  const onLostFocusEventHandlerTooltip = (event, title) => {
    switch (title) {
    case "base entities":
      setTooltipVisible({...isTooltipVisible, baseEntities: false});
      break;
    case "related entities":
      if (props.graphView) {
        setTooltipVisible({...isTooltipVisible, relatedEntities: false});
      }
      break;
    case "related concepts":
      if (props.graphView) {
        setTooltipVisible({...isTooltipVisible, relatedConcepts: false});
      }
      break;
    case "created on":
      setTooltipVisible({...isTooltipVisible, createdOn: false});
      break;
    case "Source Name":
      setTooltipVisible({...isTooltipVisible, sourceName: false});
      break;
    case "Source Type":
      setTooltipVisible({...isTooltipVisible, sourceType: false});
      break;
    case "Collection":
      setTooltipVisible({...isTooltipVisible, collection: false});
      break;
    case "Flow":
      setTooltipVisible({...isTooltipVisible, flow: false});
      break;
    case "Step":
      setTooltipVisible({...isTooltipVisible, step: false});
      break;
    case "artifacts":
      setTooltipVisible({...isTooltipVisible, artifacts: false});
      break;
    default:
      break;
    }
  };

  const onFocusHandlerTooltip = (event, title) => {
    switch (title) {
    case "base entities":
      setTooltipVisible({...isTooltipVisible, baseEntities: true});
      break;
    case "related entities":
      if (props.graphView) {
        setTooltipVisible({...isTooltipVisible, relatedEntities: true});
      }
      break;
    case "related concepts":
      if (props.graphView) {
        setTooltipVisible({...isTooltipVisible, relatedConcepts: true});
      }
      break;
    case "created on":
      setTooltipVisible({...isTooltipVisible, createdOn: true});
      break;
    case "Source Name":
      setTooltipVisible({...isTooltipVisible, sourceName: true});
      break;
    case "Source Type":
      setTooltipVisible({...isTooltipVisible, sourceType: true});
      break;
    case "Collection":
      setTooltipVisible({...isTooltipVisible, collection: true});
      break;
    case "Flow":
      setTooltipVisible({...isTooltipVisible, flow: true});
      break;
    case "Step":
      setTooltipVisible({...isTooltipVisible, step: true});
      break;
    case "artifacts":
      setTooltipVisible({...isTooltipVisible, artifacts: true});
      break;
    default:
      break;
    }
  };

  const panelTitle = (title, tooltipTitle, stringTitle) => {
    let disabled =
      !props.graphView &&
      (tooltipTitle === ExploreGraphViewToolTips.relatedEntities ||
        tooltipTitle === ExploreGraphViewToolTips.relatedConcepts);
    return (
      <div className={styles.panelTitle}>
        {title}
        <span
          tabIndex={props.graphView || stringTitle === "base entities" ? 0 : undefined}
          onBlur={e => onLostFocusEventHandlerTooltip(e, stringTitle)}
          onFocus={e => onFocusHandlerTooltip(e, stringTitle)}
        >
          <HCTooltip
            text={disabled ? "" : tooltipTitle}
            id="entities-tooltip"
            placement="right"
            show={
              stringTitle === "base entities"
                ? isTooltipVisible.baseEntities
                  ? isTooltipVisible.baseEntities
                  : undefined
                : stringTitle === "related entities"
                  ? isTooltipVisible.relatedEntities
                    ? isTooltipVisible.relatedEntities
                    : undefined
                  : stringTitle === "related concepts"
                    ? isTooltipVisible.relatedConcepts
                      ? isTooltipVisible.relatedConcepts
                      : undefined
                    : undefined
            }
          >
            <i>
              <FontAwesomeIcon
                className={disabled ? styles.disabledEntitiesInfoIcon : styles.entitiesInfoIcon}
                icon={faInfoCircle}
                size="sm"
              />
            </i>
          </HCTooltip>
        </span>
      </div>
    );
  };

  const handleToggleDataHubArtifacts = event => {
    const {target, type, key} = event;
    if (target) {
      if (type === "keydown") {
        if (key === "Enter") {
          target.checked = !target.checked;
          props.setHubArtifactsVisibilityPreferences(target.checked);
        }
      } else {
        props.setHubArtifactsVisibilityPreferences(!target.checked);
      }
    }
  };

  const selectTimeOptions = dateRangeOptions.map(timeBucket => ({value: timeBucket, label: timeBucket}));

  useEffect(() => {
    setSearchBox(searchOptions.query);
    searchOptions.query && setQueryGreyedOptions(searchOptions.query);
  }, [searchOptions]);

  const handleSearchBox = e => {
    setQueryGreyedOptions(e.target.value);
    setSearchBox(e.target.value);
  };

  const handleSetCurrentBaseEntities = entities => {
    setCheckAllRelatedEntities(true);
    setCheckAllRelatedConcepts(true);
    props.setCurrentBaseEntities(entities);
  };

  const handleSearchFromInput = () => {
    setSearchOptions({...searchOptions, query: greyedOptions.query});
  };

  const onKeyDownEnter = (e, functionToRunOnEnter, datasource) => {
    if (e.key === "Enter") {
      functionToRunOnEnter(datasource !== "final" || datasource !== "staging" ? datasource : e.target.value);
    }
  };

  return (
    <div className={styles.sideBarContainer} id={"sideBarContainer"}>
      <div className={styles.searchInput}>
        <HCInput
          id="graph-view-filter-input"
          dataCy="search-bar"
          dataTestid="search-bar"
          value={searchBox}
          onChange={handleSearchBox}
          onPressEnter={handleSearchFromInput}
          suffix={
            <button
              data-testid="search-icon"
              disabled={
                Object.keys(greyedOptions.selectedFacets).length === 0 && greyedOptions.query === searchOptions.query
              }
              className={styles.searchIcon}
              onClick={handleSearchFromInput}
            >
              <FontAwesomeIcon icon={faSearch} size="sm" />
            </button>
          }
          placeholder="Search"
          size="sm"
        />
      </div>

      <Form className={"m-3 switch-button-group"}>
        <Form.Check
          tabIndex={-1}
          id="switch-datasource-entities"
          name="switch-datasource"
          type={"radio"}
          checked={searchOptions.datasource === "entities"}
          onChange={e => setDatasourcePreferences(e.target.value)}
          aria-label="switch-datasource-entities"
          label={
            <span
              className="w-100 h-100"
              tabIndex={0}
              onKeyDown={e => onKeyDownEnter(e, setDatasourcePreferences, "entities")}
            >
              <span id="all-entities" className="curateIcon" />
              <span>Entities</span>
            </span>
          }
          value={"entities"}
          className={`mb-0 p-0  ${styles.datasourceSwitch}`}
        />
        <Form.Check
          tabIndex={-1}
          id="switch-datasource-all-data"
          name="switch-datasource"
          type={"radio"}
          value={"all-data"}
          checked={searchOptions.datasource === "all-data"}
          onChange={e => setDatasourcePreferences(e.target.value)}
          aria-label="switch-datasource-all-data"
          label={
            <span
              className="w-100 h-100"
              tabIndex={0}
              onKeyDown={e => onKeyDownEnter(e, setDatasourcePreferences, "all-data")}
            >
              <span id="all-data" className="loadIcon" />
              <span>All Data</span>
            </span>
          }
          className={`mb-0 p-0 ${styles.datasourceSwitch}`}
        />
      </Form>

      <Accordion
        aria-label="switch-database"
        id="database"
        className={"w-100 accordion-sidebar"}
        flush
        activeKey={activeKey.includes("database") ? "database" : ""}
        defaultActiveKey={activeKey.includes("database") ? "database" : ""}
      >
        <Accordion.Item eventKey="database" className={"bg-transparent"}>
          <div className={"p-0 d-flex"}>
            <Accordion.Button
              tabIndex={-1}
              className={`after-indicator ${styles.title}`}
              onClick={() => setActiveAccordion("database")}
            >
              <span tabIndex={0}>Database</span>
            </Accordion.Button>
          </div>
          <Accordion.Body>
            <Form className={"switch-button-group"}>
              <Form.Check
                tabIndex={-1}
                id="switch-database-final"
                name="switch-database"
                type={"radio"}
                value={"final"}
                checked={searchOptions.database === "final"}
                onChange={e => props.setDatabasePreferences(e.target.value)}
                aria-label="switch-database-final"
                label={
                  <span
                    tabIndex={0}
                    onKeyDown={e => onKeyDownEnter(e, props.setDatabasePreferences, "final")}
                    onFocus={() => setTooltipVisible({...isTooltipVisible, finalDb: true})}
                    onBlur={() => setTooltipVisible({...isTooltipVisible, finalDb: false})}
                  >
                    <HCTooltip
                      text={finalDbName}
                      id={`${finalDbName}-tooltip`}
                      placement="top-start"
                      show={isTooltipVisible.finalDb ? isTooltipVisible.finalDb : undefined}
                    >
                      <span>{getFinalDbLabel()}</span>
                    </HCTooltip>
                  </span>
                }
                className={`mb-0 p-0 ${styles.databaseSwitch}`}
              />
              <Form.Check
                tabIndex={-1}
                id="switch-database-staging"
                name="switch-database"
                value={"staging"}
                type={"radio"}
                checked={searchOptions.database === "staging"}
                onChange={e => props.setDatabasePreferences(e.target.value)}
                aria-label="switch-database-staging"
                label={
                  <span
                    tabIndex={0}
                    onKeyDown={e => {
                      if (e.key === "Enter") {
                        props.setDatabasePreferences("staging");
                      }
                    }}
                    onFocus={() => setTooltipVisible({...isTooltipVisible, stagingDb: true})}
                    onBlur={() => setTooltipVisible({...isTooltipVisible, stagingDb: false})}
                  >
                    <HCTooltip
                      text={stagingDbName}
                      id={`${stagingDbName}-tooltip`}
                      placement="top-start"
                      show={isTooltipVisible.stagingDb ? isTooltipVisible.stagingDb : undefined}
                    >
                      <span>{getStagingDbLabel()}</span>
                    </HCTooltip>
                  </span>
                }
                className={`mb-0 p-0 ${styles.databaseSwitch}`}
              />
            </Form>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <HCDivider className={"mt-1 mb-2"} style={{backgroundColor: "#ccc"}} />
      {searchOptions.datasource && searchOptions.datasource !== "all-data" && (
        <>
          <Accordion
            id="baseEntities"
            className={"w-100 accordion-sidebar"}
            flush
            activeKey={activeKey.includes("baseEntities") ? "baseEntities" : ""}
            defaultActiveKey={activeKey.includes("baseEntities") ? "baseEntities" : ""}
          >
            <Accordion.Item eventKey="baseEntities" className={"bg-transparent"}>
              <div className={"p-0 d-flex"}>
                <Accordion.Button
                  tabIndex={-1}
                  className={`after-indicator ${styles.titleBaseEntities}`}
                  onClick={() => setActiveAccordion("baseEntities")}
                >
                  {panelTitle(
                    <span tabIndex={0}>base entities</span>,
                    ExploreGraphViewToolTips.baseEntities,
                    "base entities",
                  )}
                </Accordion.Button>
              </div>
              <Accordion.Body>
                <BaseEntitiesFacet
                  setCurrentBaseEntities={handleSetCurrentBaseEntities}
                  setEntitySpecificPanel={props.setEntitySpecificPanel}
                  currentBaseEntities={props.currentBaseEntities}
                  entityIndicatorData={props.entityIndicatorData}
                  setActiveAccordionRelatedEntities={setActiveAccordion}
                  allBaseEntities={props.entityDefArray}
                  activeKey={activeKey}
                />
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
          <HCDivider className={"mt-0 mb-2"} style={{backgroundColor: "#ccc"}} />
          {props.currentRelatedEntities?.size > 0 && (
            <div className={styles.relatedEntityPanel}>
              <HCTooltip
                text={!props.graphView ? exploreSidebar.disabledRelatedEntities : ""}
                aria-label="disabled-related-entity-tooltip"
                id="disabled-related-entity-tooltip"
                placement="bottom"
              >
                <Accordion
                  id="related-entities"
                  data-testid={"related-entity-panel"}
                  className={"w-100 accordion-sidebar"}
                  flush
                  activeKey={activeKey.includes("related-entities") && props.graphView ? "related-entities" : ""}
                  defaultActiveKey={activeKey.includes("related-entities") ? "related-entities" : ""}
                >
                  <Accordion.Item eventKey="related-entities" className={"bg-transparent"}>
                    <div className={"p-0 d-flex"}>
                      <Accordion.Button
                        tabIndex={-1}
                        className={
                          !props.graphView
                            ? `after-indicator ${styles.disabledTitleCheckbox}`
                            : `after-indicator ${styles.titleCheckbox}`
                        }
                        aria-label="related-entities-checkbox"
                        onClick={() => setActiveAccordion("related-entities")}
                      >
                        {panelTitle(
                          <span tabIndex={0}>
                            <span className={!activeRelatedEntities ? styles.disabledCheckbox : ""}>
                              <HCCheckbox
                                ariaLabel="related-entities-checkbox"
                                id="check-all"
                                value="check-all"
                                disabled={!props.graphView}
                                cursorDisabled={!activeRelatedEntities}
                                handleClick={
                                  activeRelatedEntities
                                    ? event => onCheckAllChanges(event)
                                    : () => {
                                      return;
                                    }
                                }
                                handleKeyDown={onCheckAllRelatedEntities}
                                checked={checkAllRelatedEntities}
                              />
                            </span>
                            related entities
                          </span>,
                          ExploreGraphViewToolTips.relatedEntities,
                          "related entities",
                        )}
                      </Accordion.Button>
                    </div>
                    <Accordion.Body>
                      <RelatedEntitiesFacet
                        currentRelatedEntities={props.currentRelatedEntities}
                        setCurrentRelatedEntities={props.setCurrentRelatedEntities}
                        onSettingCheckedList={onSettingRelatedEntitiesCheckedList}
                        setEntitySpecificPanel={props.setEntitySpecificPanel}
                        setActiveRelatedEntities={setActiveRelatedEntities}
                        entityIndicatorData={props.entityIndicatorData}
                      />
                    </Accordion.Body>
                  </Accordion.Item>
                </Accordion>
              </HCTooltip>
              <HCDivider className={"mt-0 mb-2"} style={{backgroundColor: "#ccc"}} />
            </div>
          )}
          {!props.graphConceptsSearchSupported ? (
            <div className={styles.relatedEntityPanel}>
              <HCTooltip
                text={exploreSidebar.versionLimitedConcepts(getEnvironment().marklogicVersion)}
                aria-label="disabled-related-concept-tooltip"
                id="disabled-related-concept-tooltip"
                placement="bottom"
              >
                <Accordion
                  id="related-concepts"
                  data-testid={"related-concepts-panel"}
                  className={"w-100 accordion-sidebar"}
                  flush
                  activeKey={""}
                  defaultActiveKey={activeKey.includes("related-concepts") ? "related-concepts" : ""}
                >
                  <Accordion.Item eventKey="related-concepts" className={"bg-transparent"}>
                    <div className={"p-0 d-flex"}>
                      <Accordion.Button tabIndex={-1} className={`after-indicator ${styles.disabledTitleCheckbox}`}>
                        {panelTitle(
                          <span tabIndex={0}>
                            <span className={styles.disabledCheckbox}>
                              <HCCheckbox
                                ariaLabel="related-concepts-checkbox"
                                id="check-all"
                                value="check-all"
                                disabled={!props.graphConceptsSearchSupported}
                                cursorDisabled={!props.graphConceptsSearchSupported}
                                handleClick={() => {
                                  return;
                                }}
                                checked={true}
                              />
                            </span>
                            related concepts
                          </span>,
                          ExploreGraphViewToolTips.relatedConcepts,
                          "related concepts",
                        )}
                      </Accordion.Button>
                    </div>
                  </Accordion.Item>
                </Accordion>
              </HCTooltip>
              <HCDivider className={"mt-0 mb-2"} style={{backgroundColor: "#ccc"}} />
            </div>
          ) : (
            props.currentRelatedConcepts?.size > 0 && (
              <div className={styles.relatedEntityPanel}>
                <HCTooltip
                  text={
                    !props.graphView
                      ? exploreSidebar.disabledRelatedConcepts
                      : !props.viewConcepts
                        ? exploreSidebar.relatedConceptsToggledOff
                        : ""
                  }
                  aria-label="disabled-related-concept-tooltip"
                  id="disabled-related-concept-tooltip"
                  placement="bottom"
                >
                  <Accordion
                    id="related-concepts"
                    data-testid={"related-concepts-panel"}
                    className={"w-100 accordion-sidebar"}
                    flush
                    activeKey={
                      activeKey.includes("related-concepts") && props.graphView && props.viewConcepts
                        ? "related-concepts"
                        : ""
                    }
                    defaultActiveKey={activeKey.includes("related-concepts") ? "related-concepts" : ""}
                  >
                    <Accordion.Item eventKey="related-concepts" className={"bg-transparent"}>
                      <div className={"p-0 d-flex"}>
                        <Accordion.Button
                          tabIndex={-1}
                          className={
                            !props.graphView || !props.viewConcepts
                              ? `after-indicator ${styles.disabledTitleCheckbox}`
                              : `after-indicator ${styles.titleCheckbox}`
                          }
                          onClick={() => setActiveAccordion("related-concepts")}
                        >
                          {panelTitle(
                            <span tabIndex={0}>
                              <HCCheckbox
                                ariaLabel="related-concepts-checkbox"
                                id="check-all"
                                value="check-all"
                                disabled={!props.graphView || !props.viewConcepts}
                                cursorDisabled={false}
                                handleClick={onCheckAllRelatedConceptsClick}
                                handleKeyDown={onCheckAllRelatedConceptsKeyDown}
                                checked={checkAllRelatedConcepts}
                              />

                              related concepts
                            </span>,
                            ExploreGraphViewToolTips.relatedConcepts,
                            "related concepts",
                          )}
                        </Accordion.Button>
                      </div>
                      <Accordion.Body>
                        <RelatedConceptsFacets
                          currentRelatedConcepts={props.currentRelatedConcepts}
                          setCurrentRelatedConcepts={props.setCurrentRelatedConcepts}
                          onSettingCheckedList={onSettingRelatedConceptsCheckedList}
                          entityIndicatorData={props.entityIndicatorData}
                        />
                      </Accordion.Body>
                    </Accordion.Item>
                  </Accordion>
                </HCTooltip>
                <HCDivider className={"mt-0 mb-2"} style={{backgroundColor: "#ccc"}} />
              </div>
            )
          )}
        </>
      )}

      {props.cardView ? (
        <div className={styles.toggleDataHubArtifacts}>
          <Form.Check
            type="switch"
            data-testid="toggleHubArtifacts"
            defaultChecked={!props.hideDataHubArtifacts}
            tabIndex={0}
            onChange={handleToggleDataHubArtifacts}
            onKeyDown={event => handleToggleDataHubArtifacts(event)}
            className={styles.switchToggleDataHubArtifacts}
            label={
              <div>
                <span>Include Data Hub artifacts</span>
                <span
                  tabIndex={props.cardView ? 0 : undefined}
                  onFocus={e => onFocusHandlerTooltip(e, "artifacts")}
                  onBlur={e => onLostFocusEventHandlerTooltip(e, "artifacts")}
                >
                  <HCTooltip
                    text={tooltips.includingDataHubArtifacts}
                    aria-label="toggle-data-hub-artifacts-tooltip"
                    id="toggle-data-hub-artifacts-tooltip"
                    placement="bottom"
                    show={isTooltipVisible.artifacts ? isTooltipVisible.artifacts : undefined}
                  >
                    <i>
                      <FontAwesomeIcon icon={faInfoCircle} className={styles.infoIcon} />
                    </i>
                  </HCTooltip>
                </span>
              </div>
            }
          />
          {/* <FormCheck
          type="switch"
          data-testid="toggleHubArtifacts"
          defaultChecked={!props.hideDataHubArtifacts}
          tabIndex={0}
          onClick={handleToggleDataHubArtifacts}
          onKeyDown={(event) => { if (event.key === "Enter") { props.setHubArtifactsVisibilityPreferences(!event.target.value); } }}
          className={styles.switchToggleDataHubArtifacts}
          label={
            <div>
              <span>Include Data Hub artifacts</span>
              <span tabIndex={props.cardView ? 0 : undefined} onFocus={(e) => onFocusHandlerTooltip(e, "artifacts")} onBlur={(e) => onLostFocusEventHandlerTooltip(e, "artifacts")}>
                <HCTooltip text={tooltips.includingDataHubArtifacts} id="include-data-artifacts-tooltip" placement="bottom" show={isTooltipVisible.artifacts ? isTooltipVisible.artifacts : undefined}>
                  <i><FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" data-testid="info-tooltip-toggleDataHubArtifacts" /></i>
                </HCTooltip>
              </span>
            </div>
          }
        /> */}
        </div>
      ) : (
        ""
      )}
      <Accordion
        id="hub-properties"
        className={"w-100 accordion-sidebar"}
        flush
        activeKey={activeKey.includes("hubProperties") ? "hubProperties" : ""}
        defaultActiveKey={activeKey.includes("hubProperties") ? "hubProperties" : ""}
      >
        <Accordion.Item eventKey="hubProperties" className={"bg-transparent"}>
          <div className={"p-0 d-flex"}>
            <Accordion.Button
              tabIndex={-1}
              className={`after-indicator ${styles.title}`}
              onClick={() => setActiveAccordion("hubProperties")}
            >
              <span tabIndex={0}>Hub Properties</span>
            </Accordion.Button>
          </div>
          <Accordion.Body>
            <div className={styles.facetName} data-cy="created-on-facet">
              Created On
              <span
                tabIndex={0}
                onFocus={e => onFocusHandlerTooltip(e, "created on")}
                onBlur={e => onLostFocusEventHandlerTooltip(e, "created on")}
              >
                <HCTooltip
                  text={tooltips.createdOn}
                  id="created-on-tooltip"
                  placement="top-start"
                  show={isTooltipVisible.createdOn ? isTooltipVisible.createdOn : undefined}
                >
                  <i>
                    <FontAwesomeIcon className={styles.infoIcon} icon={faInfoCircle} size="sm" />
                  </i>
                </HCTooltip>
              </span>
            </div>
            <div className={"my-3"}>
              <Select
                tabSelectsValue={false}
                openMenuOnFocus={true}
                id="date-select-wrapper"
                inputId="date-select"
                placeholder="Select time"
                value={selectTimeOptions.find(oItem => oItem.value === dateRangeValue) || ""}
                onChange={handleOptionSelect}
                isSearchable={false}
                aria-label="date-select"
                options={selectTimeOptions}
                styles={reactSelectThemeConfig}
              />
            </div>
            <div className={styles.dateTimeWindow}>{timeWindow(dateRangeValue)}</div>
            {dateRangeValue === "Custom" && (
              <HCDateTimePicker
                name="range-picker"
                className={styles.datePicker}
                value={datePickerValue}
                onChange={onDateChange}
                parentEl="#date-select-wrapper"
              />
            )}
            {hubFacets.map(facet => {
              return (
                facet && (
                  <Facet
                    name={facet.hasOwnProperty("displayName") ? facet.displayName : facet.facetName}
                    constraint={facet.facetName}
                    facetValues={facet.facetValues}
                    key={facet.facetName}
                    tooltip={facet.tooltip}
                    facetType={facet.type}
                    facetCategory="hub"
                    updateSelectedFacets={updateSelectedFacets}
                    addFacetValues={addFacetValues}
                    referenceType={facet.referenceType}
                    entityTypeId={facet.entityTypeId}
                    propertyPath={facet.propertyPath}
                    maxQuantityOnFacets={maxQuantityOnFacets}
                    isTooltipVisible={isTooltipVisible}
                    onFocusHandlerTooltip={onFocusHandlerTooltip}
                    onLostFocusEventHandlerTooltip={onLostFocusEventHandlerTooltip}
                  />
                )
              );
            })}
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default Sidebar;
