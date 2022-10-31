import React, {useState, useEffect, useContext, useLayoutEffect, useCallback, createElement} from "react";
import Graph from "react-graph-vis";
import "./graph-vis.scss";
import styles from "./graph-vis.module.scss";
import {ModelingContext} from "@util/modeling-context";
import ReactDOMServer from "react-dom/server";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import NodeSvg from "./node-svg";
import graphConfig from "@config/graph-vis.config";
import AddEditRelationship from "../relationship-modal/add-edit-relationship";
import {defaultHubCentralConfig} from "@config/modeling.config";
import {defaultIcon, defaultConceptIcon} from "@config/explore.config";
import {ViewType} from "../../../../types/modeling-types";
import * as _ from "lodash";
import {UserContext} from "@util/user-context";
import {getUserPreferences, updateUserPreferences} from "../../../../services/user-preferences";
import {entitiesConfigExist, getCategoryWithinModel, iconExistsForNode} from "@util/modeling-utils";
import * as FontIcon from "react-icons/fa";
import {renderToStaticMarkup} from "react-dom/server";
import {DEFAULT_NODE_CONFIG} from "@config/modeling.config";
import {themeColors} from "@config/themes.config";
import {HCAlert, HCModal} from "@components/common";
import {Modal} from "react-bootstrap";
import {ModelingMessages} from "@config/tooltips.config";
import {getMappingFunctions} from "@api/mapping";

type Props = {
  dataModel: any;
  handleEntitySelection: any;
  filteredEntityTypes: any;
  entitySelected: any;
  isEntitySelected: boolean;
  updateSavedEntity: any;
  toggleRelationshipModal: any;
  relationshipModalVisible: any;
  canReadEntityModel: any;
  canWriteEntityModel: any;
  graphEditMode: any;
  setGraphEditMode: any;
  setCoordsChanged: any;
  hubCentralConfig: any;
  updateHubCentralConfig: (hubCentralConfig: any) => void;
  getColor: any;
  exportPngButtonClicked: boolean;
  setExportPngButtonClicked: any;
  nodeNeedRedraw: boolean;
  setNodeNeedRedraw: any;
};

let entityMetadata = {};
// TODO temp hardcoded node data, remove when retrieved from db
// entityMetadata = graphConfig.sampleMetadata;

const GraphVis: React.FC<Props> = (props) => {

  const {
    user
  } = useContext(UserContext);
  const userPreferences = JSON.parse(getUserPreferences(user.name));

  const setGraphPreferences = (options) => {
    let preferencesObject = {
      modelingGraphOptions: options
    };
    updateUserPreferences(user.name, preferencesObject);
  };

  const graphType = "shape";

  const {modelingOptions, setSelectedEntity} = useContext(ModelingContext);

  const coordinatesExist = () => {
    let coordsExist = true;
    let newNodeCounter = 0;
    if (entitiesConfigExist(props.hubCentralConfig)) {
      let allNodeCoordinates = props.hubCentralConfig["modeling"];
      for (const node of props.dataModel) {
        let isConcept = node.hasOwnProperty("conceptName");
        let nodeName = !isConcept ? node.entityName : node.conceptName;
        let modelCategory = getCategoryWithinModel(isConcept);
        if (!allNodeCoordinates[modelCategory][nodeName] ||
          (!allNodeCoordinates[modelCategory][nodeName].graphX && !allNodeCoordinates[modelCategory][nodeName].graphY)) {
          //count number of new nodes, if they only added one, no need for physics to stabilize entire graph on line 184
          newNodeCounter = newNodeCounter + 1;
        }
      }
      if (newNodeCounter > 2) {
        coordsExist = false;
      }
    } else {
      coordsExist = false;
    }
    return coordsExist;
  };
  const [physicsEnabled, setPhysicsEnabled] = useState(userPreferences?.modelingGraphOptions?.physicsEnabled || true);
  const [graphData, setGraphData] = useState({nodes: [], edges: []});
  let testingMode = true; // Should be used further to handle testing only in non-production environment
  const [openRelationshipModal, setOpenRelationshipModal] = useState(false);
  const [selectedRelationship, setSelectedRelationship] = useState<any>({});
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [clickedNode, setClickedNode] = useState(undefined);
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number }>({x: 0, y: 0});
  const [newRelationship, setNewRelationship] = useState(false);
  const [escKeyPressed, setEscKeyPressed] = useState(false);
  const [coordsLoaded, setCoordsLoaded] = useState(false);
  const [coords, setCoords] = useState<any>(defaultHubCentralConfig);
  const [hasStabilized, setHasStabilized] = useState(false);

  // Get network instance on init
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
  };
  const [networkHeight, setNetworkHeight] = useState(graphConfig.defaultOptions.height);
  const vis = require("vis-network/standalone/umd/vis-network"); //eslint-disable-line @typescript-eslint/no-unused-vars

  const [invalidSource, setInvalidSource] = useState(false);

  // For storing mapping functions
  const [mapFunctions, setMapFunctions] = useState<any>([]);

  // Load coords *once* on init
  useEffect(() => {
    if (!coordsLoaded && entitiesConfigExist(props.hubCentralConfig)) {
      let allConfig = props.hubCentralConfig;
      setCoords(allConfig);
      setCoordsLoaded(true);
      if (network) {
        updateNetworkHeight();
      }
    } else {
      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });
    }
  }, [props.hubCentralConfig]);

  useEffect(() => {
    if (modelingOptions.view === ViewType.graph) {
      if (network && coordsLoaded) {
        initializeScaleAndViewPosition();
      }
    }
  }, [network, modelingOptions.view]);

  useEffect(() => {
    if (props.exportPngButtonClicked) {
      let canvas = document.getElementsByClassName("vis-network")[0]["canvas"];
      let link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.setAttribute("download", "graph-view-model");
      document.body.appendChild(link);
      link.click();
      props.setExportPngButtonClicked(false);
    }
  }, [props.exportPngButtonClicked]);

  const updateNetworkHeight = async () => {
    let baseHeight = Math.round(window.innerHeight - network.body.container.offsetTop);
    if (window.devicePixelRatio < 2) {
      baseHeight = Math.round(window.innerHeight - (network.body.container.offsetTop * window.devicePixelRatio));
    }
    let height = (baseHeight < 505 ? 505 : baseHeight) + "px";
    setNetworkHeight(height);
  };

  useLayoutEffect(() => {
    const updateSize = _.debounce(() => {
      updateNetworkHeight();
    }, 400);
    if (network) {
      window.addEventListener("resize", updateSize);
    }
    return () => window.removeEventListener("resize", updateSize);
  }, [network && window.innerHeight && window.devicePixelRatio]);

  // Initialize or update graph
  useEffect(() => {
    if (props.dataModel) {
      if (coordinatesExist()) {
        if (physicsEnabled) {
          setPhysicsEnabled(false);
        }
      } else {
        if (!physicsEnabled) {
          setPhysicsEnabled(true);
        }
      }

      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });

      const updateGraphSettings = async () => {
        await updateNetworkHeight();
        initializeScaleAndViewPosition();
      };

      //Initialize graph zoom scale and view position
      if (network) {
        updateGraphSettings();
      }
      //setSaveAllCoords(true);
      return () => {
        setClickedNode(undefined);
        setContextMenuVisible(false);
      };
    }
  }, [props.dataModel, props.filteredEntityTypes.length, coordsLoaded]);

  const initializeScaleAndViewPosition = () => {
    if (props.hubCentralConfig?.modeling) {
      let model = props.hubCentralConfig.modeling;
      let moveToConfig = {};
      if (model.scale) {
        moveToConfig["scale"] = model.scale;
      }
      if (model.viewPosition && Object.keys(model.viewPosition).length) {
        moveToConfig["position"] = model.viewPosition;
      }
      network.moveTo(moveToConfig);
    }
  };

  const coordsExist = (nodeName, isConcept) => {
    let result = false;
    if (entitiesConfigExist(props.hubCentralConfig)) {
      let model = !isConcept ? props.hubCentralConfig["modeling"]["entities"] : props.hubCentralConfig["modeling"]["concepts"];
      if (model[nodeName]) {
        if (model[nodeName].graphX &&
          model[nodeName].graphY) {
          result = true;
        }
      }
    }
    return result;
  };

  const selectedEntityExists = () => {
    return props.dataModel.some(e => {
      let isConcept = e.hasOwnProperty("conceptName");
      let nodeName = !isConcept ? e.entityName : e.conceptName;
      return nodeName === modelingOptions.selectedEntity;
    });
  };

  const saveUnsavedCoords = async (positions) => {
    if (props.dataModel) {
      let newCoords = {...coords};
      props.dataModel.forEach(ent => {
        const isConcept = ent.hasOwnProperty("conceptName");
        let nodeName = isConcept ? ent.conceptName : ent.entityName;
        if (!coordsExist(nodeName, isConcept)) {
          let nodePositions = positions[nodeName];
          let modelCategory = getCategoryWithinModel(isConcept);
          let nodeCoordObject = newCoords["modeling"][modelCategory][nodeName] || {};
          if (!Object.keys(nodeCoordObject).length) {
            newCoords["modeling"][modelCategory][nodeName] = {graphX: nodePositions.x, graphY: nodePositions.y};
          } else {
            newCoords["modeling"][modelCategory][nodeName]["graphX"] = nodePositions.x;
            newCoords["modeling"][modelCategory][nodeName]["graphY"] = nodePositions.y;
          }
        }
      });
      setCoords(newCoords);
      if (props.updateHubCentralConfig && (Object.keys(newCoords["modeling"]["entities"]).length > 0 || Object.keys(newCoords["modeling"]["concepts"]).length > 0)) {
        await props.updateHubCentralConfig(newCoords);
        props.setCoordsChanged(true);
      }
    }
  };

  const escFunction = useCallback((event) => {
    if (event.keyCode === 27) {
      //Detect when esc is pressed, set state to disable edit mode
      setEscKeyPressed(true);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", escFunction, false);

    return () => {
      document.removeEventListener("keydown", escFunction, false);
    };
  }, []);

  useEffect(() => {
    //turn off edit mode on escape keydown
    if (network && props.graphEditMode) {
      network.disableEditMode();
      props.setGraphEditMode(false);
      if (invalidSource) {
        setInvalidSource(false);
      }
    }
    setEscKeyPressed(false);
  }, [escKeyPressed]);

  //turn on edit mode
  useEffect(() => {
    if (props.graphEditMode) {
      if (network) {
        network.addEdgeMode();
      }
      // setPhysicsEnabled(false);
    }
  }, [props.graphEditMode]);

  //turn off edit mode on cancel modal
  useEffect(() => {
    if (!openRelationshipModal && props.graphEditMode) {
      if (network) {
        network.disableEditMode();
      }
      props.setGraphEditMode(false);
      // network.addEdgeMode();
    }
  }, [openRelationshipModal]);

  // Focus on the selected nodes in filter input
  useEffect(() => {
    let focused = true;
    (async () => {
      if (focused && network && props.isEntitySelected) {
        let viewPosition: any = await network.getViewPosition();
        await network.focus(props.entitySelected);
        let viewPositionPayload = props.hubCentralConfig;
        viewPositionPayload.modeling["viewPosition"] = viewPosition;
        props.updateHubCentralConfig(viewPositionPayload);
        if (clickedNode) {
          setClickedNode(undefined);
        }
      }
    })();
    return () => {
      focused = false;
    };
  }, [network, props.isEntitySelected, props.entitySelected]);

  // React to node selection from outside (e.g. new node created)
  useEffect(() => {
    if (network && modelingOptions.selectedEntity) {
      // Ensure entity exists
      if (selectedEntityExists()) {
        // Persist selection and coords
        network.selectNodes([modelingOptions.selectedEntity]);
        if (!nodeCoordinatesExist()) {
          let positions = network.getPositions();
          saveUnsavedCoords(positions);
        }
      } else {
        // Entity type not found, unset in context
        setSelectedEntity(undefined);
      }
    }
  }, [network, modelingOptions.selectedEntity]);

  useEffect(() => {
    if (props.nodeNeedRedraw) {
      if (network) {
        network.selectNodes([modelingOptions.selectedEntity]);
        network.deleteSelected();
      }
      props.setNodeNeedRedraw(false);
    }
  }, [props.nodeNeedRedraw]);

  useLayoutEffect(() => {
    if (testingMode && network) {
      window.graphVisApi = {
        getNodePositions: (nodeIds?: any) => { return !nodeIds ? network.getPositions() : network.getPositions(nodeIds); },
        canvasToDOM: (xCoordinate, yCoordinate) => { return network.canvasToDOM({x: xCoordinate, y: yCoordinate}); },
      };
    }
  }, [network]);

  // TODO update when icons are implemented
  const getIcon = (entityName) => {
    let icon = <FontAwesomeIcon icon={faFileExport} aria-label="node-icon" />;
    return ReactDOMServer.renderToString(icon);
  };

  const getDescription = (entityName) => {
    let entityIndex = props.dataModel.findIndex(obj => (obj.entityName || obj.conceptName) === entityName);
    return props.dataModel[entityIndex].model.definitions ?
      (props.dataModel[entityIndex].model.definitions[entityName] ?
        props.dataModel[entityIndex].model.definitions[entityName].description : "") :
      props.dataModel[entityIndex].model.info.description;
  };

  // TODO remove when num instances is retrieved from db
  const getNumInstances = (entityName) => {
    let num = -123;
    if (entityMetadata[entityName] && entityMetadata[entityName].instances) {
      num = entityMetadata[entityName].instances;
    }
    return num;
  };

  const roundedRect = (ctx: any, x: number, y: number, width: number, height: number, radius: number) => {
    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.arcTo(x, y + height, x + radius, y + height, radius);
    ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
    ctx.arcTo(x + width, y, x + width - radius, y, radius);
    ctx.arcTo(x, y, x, y + radius, radius);
  };

  const getNodes = () => {
    let nodes;
    if (graphType === "shape") {
      const {boxWidth: defaultBoxWidth, boxHeight, boxPadding, boxRadius, iconWidth, iconHeight, iconRightMargin} = DEFAULT_NODE_CONFIG;
      nodes = props.dataModel && props.dataModel?.map((e) => {
        const isConcept = e.hasOwnProperty("conceptName");
        let nodeName = !isConcept ? e.entityName : e.conceptName;
        const nodeId = nodeName;
        const nodeSettings: any = {
          id: nodeId,
          shape: "custom"
        };
        let node = !isConcept ? props.hubCentralConfig?.modeling?.entities[nodeId] : props.hubCentralConfig?.modeling?.concepts[nodeId];
        let modelCategory = getCategoryWithinModel(isConcept);
        let boxLabel = nodeName;
        if (nodeName.length > 20) {
          nodeSettings.title = nodeName;
          boxLabel = nodeName.substring(0, 20) + "...";
        }
        if (getDescription(nodeName) && getDescription(nodeName).length > 0) {
          nodeSettings.title = nodeName.length > 20 ? nodeSettings.title + "\n" + getDescription(nodeName) : getDescription(nodeName);
        }

        if (!!coords.modeling[modelCategory][nodeName] &&
          !!coords.modeling[modelCategory][nodeName].graphX &&
          !!coords.modeling[modelCategory][nodeName].graphY) {
          nodeSettings.x = coords.modeling[modelCategory][nodeName].graphX;
          nodeSettings.y = coords.modeling[modelCategory][nodeName].graphY;
        }

        return {
          ...nodeSettings,
          ctxRenderer: ({ctx, x, y, state: {selected, hover}, style, label}) => {
            let iconName = iconExistsForNode(nodeId, isConcept, props.hubCentralConfig) ? node.icon : (isConcept ? defaultConceptIcon : defaultIcon);
            ctx.font = "bold 14px Arial";
            let measureText = ctx.measureText(boxLabel);
            let boxWidth = measureText.width + iconWidth + iconRightMargin + boxPadding * 2;
            boxWidth = boxWidth < defaultBoxWidth ? defaultBoxWidth : boxWidth;
            const drawNode = () => {

              roundedRect(ctx, x - boxWidth / 2, y - boxHeight / 2, boxWidth, boxHeight, boxRadius);
              ctx.lineWidth = nodeName === modelingOptions.selectedEntity && props.entitySelected ? 2 : isConcept ? 2 : 0;
              if (isConcept) {
                ctx.setLineDash([5, 5]);
              }
              if (selected && hover) {
                ctx.fillStyle = graphConfig.nodeStyles.hoverColor;
                ctx.strokeStyle = graphConfig.nodeStyles.selectColor;
                ctx.lineWidth = isConcept ? 3 : 2;
              } else if (selected) {
                ctx.fillStyle = props.getColor(nodeId, isConcept);
                ctx.strokeStyle = graphConfig.nodeStyles.selectColor;
                ctx.lineWidth = isConcept ? 3 : 2;
              } else if (hover) {
                ctx.fillStyle = graphConfig.nodeStyles.hoverColor;
                ctx.strokeStyle = graphConfig.nodeStyles.hoverColor;
                ctx.lineWidth = 2;
              } else {
                ctx.fillStyle = props.getColor(nodeName, isConcept);
                ctx.strokeStyle = isConcept ? themeColors["text-color-secondary"] : props.getColor(nodeName, isConcept);
                ctx.lineWidth = isConcept ? 2 : 0;
              }
              ctx.closePath();
              ctx.save();
              ctx.fill();
              ctx.stroke();
              ctx.restore();

              ctx.fillStyle = "Black";
              ctx.textAlign = "left";
              ctx.textBaseline = "middle";
              const textOffsetX = x - boxWidth / 2 + boxPadding + iconWidth + iconRightMargin;
              ctx.fillText(boxLabel, textOffsetX, y);
              let img = new Image();   // Create new img element
              img.src = `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(FontIcon[iconName])))}`;
              //Drawing the image on canvas
              const iconOffsetX = x - boxWidth / 2 + boxPadding;
              const iconOffsetY = y - iconHeight / 2;
              ctx.drawImage(img, iconOffsetX, iconOffsetY, iconWidth, iconHeight);
            };
            return {
              drawNode,
              nodeDimensions: {width: boxWidth, height: boxHeight},
            };
          }
        };
      });
    } else if (graphType === "image") { // TODO for custom SVG node, not currently used
      nodes = props.dataModel && props.dataModel?.map((e) => {
        const node = new NodeSvg(e.entityName, props.getColor(e.entityName), getNumInstances(e.entityName), getIcon(e.entityName));
        let tempTitle;
        if (getDescription(e.entityName) && getDescription(e.entityName).length) {
          tempTitle = getDescription(e.entityName);
        }
        return {
          id: e.entityName,
          label: "",
          title: tempTitle,
          image: "data:image/svg+xml;charset=utf-8," + node.getSvg(),
          shape: "image"
        };
      });
    }
    return nodes;
  };

  const onChosen = (values, id, selected, hovering) => {
    if (!props.canWriteEntityModel && props.canReadEntityModel) {
      //hide interactions if edit permissinos are missing
    } else {
      values.color = "#7FADE3";

      //change one to many image
      if (values.toArrowSrc === graphConfig.customEdgeSVG.oneToMany) {
        values.toArrowSrc = graphConfig.customEdgeSVG.oneToManyHover;
      } else {
        //change one to one image
        values.toArrowSrc = graphConfig.customEdgeSVG.oneToOneHover;
      }
    }
  };

  // Handle multiple edges between nodes:
  // 1. Count how many same edges were drawn before current edge
  // 2. Check if previous edge is in same or reversed direction
  //    (so we can draw it the correct way, CW or CCW)
  const getSmoothOpts = (to, from, edges) => {
    let count = 0;
    let reversed;
    edges.forEach((edge, i) => {
      if (to === edge.to && from === edge.from) {
        count++;
        // This works so...
        reversed = (reversed === undefined) ? false : reversed;
      } else if (from === edge.to && to === edge.from) {
        count++;
        reversed = (reversed === undefined) ? true : reversed;
      }
    });
    // Space out same edges using visjs "smooth" options
    let space = 0.16;
    let type = "";
    if (!reversed) {
      type = (count % 2 === 0) ? "curvedCW" : "curvedCCW";
    } else {
      type = (count % 2 === 0) ? "curvedCCW" : "curvedCW";
    }
    return {
      enabled: (count > 0),
      type: type,
      roundness: (count % 2 === 0) ? (space * count / 2) : (space * (count + 1) / 2)
    };
  };

  const getEdges = () => {
    let edges: any = [];
    props.dataModel.forEach((e, i) => {
      if (e.model.definitions) {
        if (!e.model.definitions[e.entityName]) {
          return [];
        }

        let title = !props.canWriteEntityModel && props.canReadEntityModel ? undefined : "Edit Relationship";

        let properties: any = Object.keys(e.model.definitions[e.entityName].properties);
        properties.forEach((p, i) => {
          let pObj = e.model.definitions[e.entityName].properties[p];
          let relationshipName = p;
          if (relationshipName.length > 20) {
            relationshipName = relationshipName.substring(0, 20) + "...";
            if (title !== undefined) title = p + "\n" + title;
          }
          //for one to one edges
          if (pObj.relatedEntityType) {
            let parts = pObj.relatedEntityType.split("/");
            edges.push({
              ...graphConfig.defaultEdgeProps,
              from: e.entityName,
              to: parts[parts.length - 1],
              label: relationshipName,
              predicate: p,
              joinPropertyName: pObj.joinPropertyName,
              id: e.entityName + "-" + p + "-" + parts[parts.length - 1] + "-via-" + pObj.joinPropertyName,
              title: title,
              arrows: {
                to: {
                  enabled: true,
                  src: graphConfig.customEdgeSVG.oneToOne,
                  type: "image"
                }
              },
              arrowStrikethrough: true,
              color: "#666",
              font: {
                align: "top",
              },
              chosen: {
                label: onChosen,
                edge: onChosen,
                node: false
              },
              smooth: getSmoothOpts(e.entityName, parts[parts.length - 1], edges)
            });
            //for one to many edges
          } else if (pObj.items?.relatedEntityType) {
            let parts = pObj.items.relatedEntityType.split("/");
            edges.push({
              ...graphConfig.defaultEdgeProps,
              from: e.entityName,
              to: parts[parts.length - 1],
              label: relationshipName,
              predicate: p,
              joinPropertyName: pObj.items.joinPropertyName,
              id: e.entityName + "-" + p + "-" + parts[parts.length - 1] + "-via-" + pObj.items.joinPropertyName,
              title: title,
              arrowStrikethrough: true,
              arrows: {
                to: {
                  enabled: true,
                  src: graphConfig.customEdgeSVG.oneToMany,
                  type: "image"
                }
              },
              color: "#666",
              font: {align: "top"},
              chosen: {
                label: onChosen,
                edge: onChosen,
                node: false
              },
              smooth: getSmoothOpts(e.entityName, parts[parts.length - 1], edges)
            });
          }
        });
        if (e.model.definitions[e.entityName].hasOwnProperty("relatedConcepts")) {
          let relatedConcepts: any = e.model.definitions[e.entityName].relatedConcepts;
          relatedConcepts.forEach(obj => {
            edges.push({
              ...graphConfig.defaultEdgeProps,
              from: e.entityName,
              to: obj.conceptClass,
              label: obj.predicate,
              predicate: obj.predicate,
              joinPropertyName: obj.context,
              id: e.entityName + "-" + obj.predicate + "-" + obj.conceptClass + "-via-" + obj.context,
              title: title,
              arrows: {
                to: {
                  enabled: true,
                  src: graphConfig.customEdgeSVG.oneToOne,
                  type: "image"
                }
              },
              arrowStrikethrough: true,
              color: "#666",
              font: {
                align: "top",
              },
              chosen: {
                label: onChosen,
                edge: onChosen,
                node: false
              },
              smooth: getSmoothOpts(e.entityName, obj.conceptClass, edges),
              conceptExpression: obj.conceptExpression
            });
          });
        }
      }
    });
    return edges;
  };

  const isConceptNode = (nodeId) => {
    return props.dataModel.some(e => {
      let isConcept = e.hasOwnProperty("conceptName");
      let nodeName = !isConcept ? "" : e.conceptName;
      return nodeName === nodeId;
    });
  };

  const setMappingFunctions = async () => {
    let excludeMLMappingFunctions = true;
    let mappingFuncResponse = await getMappingFunctions(excludeMLMappingFunctions);
    if (mappingFuncResponse) {
      setMapFunctions(mappingFuncResponse.data);
    }
  };

  const getRelationshipInfo = (sourceNodeName, targetNodeName, event) => {
    let targetNodeColor;
    let edgeInfo = event && event.edges?.length > 0 ? event.edges[0] : "";
    const edge = network.body.data.edges.get(edgeInfo);
    const sourceName = sourceNodeName? sourceNodeName : edge.from;
    let isConcept = isConceptNode(targetNodeName);
    if (targetNodeName === "Select target entity type*") {
      targetNodeColor = "#ececec";
    } else {
      targetNodeColor = props.getColor(targetNodeName, isConcept);
    }
    let relationshipInfo = {
      edgeId: edgeInfo,
      sourceNodeName: sourceName,
      sourceNodeColor: props.getColor(sourceName),
      targetNodeName: targetNodeName,
      targetNodeColor: targetNodeColor,
      relationshipName: edge && edge.predicate ? edge.predicate : "",
      joinPropertyName: edge && edge.joinPropertyName ? edge.joinPropertyName : "",
      isConcept: isConcept
    };
    if (isConcept) {
      let edge = network.body.data.edges.get(edgeInfo);
      if (edge) {
        relationshipInfo["conceptExpression"] = edge.conceptExpression;
      }
      setMappingFunctions();
    }
    return relationshipInfo;
  };

  const options = {
    ...graphConfig.defaultOptions,
    height: networkHeight,
    physics: {
      enabled: physicsEnabled,
      repulsion: {
        nodeDistance: 150
      },
      minVelocity: 0.75,
      solver: "repulsion",
      stabilization: {
        fit: true
      },
    },
    interaction: {
      navigationButtons: true,
      hover: true,
      zoomView: false
    },
    manipulation: {
      enabled: false,
      addNode: function (data, callback) {
        // filling in the popup DOM elements
      },
      editNode: function (data, callback) {
        // filling in the popup DOM elements
      },
      addEdge: function (data, callback) {
        let relationshipInfo;
        if (isConceptNode(data.from)) {
          setInvalidSource(true);
        } else {
          if (data.to === data.from) {  //if node is just clicked on during add edge mode, not dragged
            let isConcept = isConceptNode(data.to);
            relationshipInfo = getRelationshipInfo(data.from, !isConcept ? "Select target entity type*" : "Select a concept class*", "");
          } else { //if edge is dragged
            relationshipInfo = getRelationshipInfo(data.from, data.to, "");
          }
          setSelectedRelationship(relationshipInfo);
          setNewRelationship(true);
          setOpenRelationshipModal(true);
        }

      }
    },
  };

  const centerOnEntity = async (event) => {
    setContextMenuVisible(false);
    if (network) {
      await network.focus(clickedNode, {offset: {x: 0, y: (modelingOptions.selectedEntity ? -200 : -60)}});
      let viewPosition: any = await network.getViewPosition();
      setClickedNode(undefined);
      let viewPositionPayload = defaultHubCentralConfig;
      viewPositionPayload.modeling["viewPosition"] = viewPosition;
      props.updateHubCentralConfig(viewPositionPayload);
    }
  };

  const menu = () => {
    return (
      <div id="contextMenu" className={styles.contextMenu} style={{left: menuPosition.x, top: menuPosition.y}}>
        {clickedNode &&
          <div key="1" className={styles.contextMenuItem} data-testid={`centerOnEntityType-${clickedNode}`} onClick={centerOnEntity}>
            Center on entity type
          </div>}
        {/*{ clickedEdge &&
      <Menu.Item key="2">
        {"Edit relationship "}
      </Menu.Item> }
        <Menu.Item key="3"> <Link to={{ pathname: "/tiles/explore", state: {entity: clickedNode}}}>
          {"Explore " + clickedNode + " instances"}
        </Link> </Menu.Item>
      <Menu.Item key="4">3rd menu item</Menu.Item>*/}
      </div>
    );
  };

  useEffect(() => {
    if (clickedNode) {
      setContextMenuVisible(true);
    } else {
      setContextMenuVisible(false);
    }
  }, [clickedNode]);

  const handleZoom = _.debounce((event, scale) => {
    let ZoomScalePayload = defaultHubCentralConfig;
    ZoomScalePayload.modeling["scale"] = scale > 0 ? scale : event.scale;
    props.updateHubCentralConfig(ZoomScalePayload);
  }, 400);

  const updateConfigOnNavigation = _.debounce(async (event) => {
    let {nodes} = event;
    if (!nodes.length || modelingOptions.selectedEntity) {
      if (entitiesConfigExist(props.hubCentralConfig)) {
        let scale: any = await network.getScale();
        let viewPosition: any = await network.getViewPosition();
        let updatedHubCentralConfig: any = props.hubCentralConfig || defaultHubCentralConfig;
        updatedHubCentralConfig["modeling"]["scale"] = scale;
        updatedHubCentralConfig["modeling"]["viewPosition"] = viewPosition;
        if (props.updateHubCentralConfig && (Object.keys(updatedHubCentralConfig["modeling"]["entities"]).length > 0 || Object.keys(updatedHubCentralConfig["modeling"]["concepts"]).length > 0)) {
          await props.updateHubCentralConfig(updatedHubCentralConfig);
          props.setCoordsChanged(true);
        }
      }
    }
  }, 400);

  const nodeCoordinatesExist = () => {
    let coordsExist = true;
    if (entitiesConfigExist(props.hubCentralConfig)) {
      let allNodeCoordinates = !!props.hubCentralConfig["modeling"] && props.hubCentralConfig["modeling"];
      for (const node of props.dataModel) {
        let isConcept = node.hasOwnProperty("conceptName");
        let nodeName = !isConcept ? node.entityName : node.conceptName;
        let modelCategory = getCategoryWithinModel(isConcept);
        let nodeObjectExists = !!allNodeCoordinates[modelCategory][nodeName];
        if (!nodeObjectExists ||
          (nodeObjectExists && !allNodeCoordinates[modelCategory][nodeName].hasOwnProperty("graphX") &&
            !allNodeCoordinates[modelCategory][nodeName].hasOwnProperty("graphY"))
        ) {
          coordsExist = false;
          break;
        }
      }
    }
    return coordsExist;
  };

  const events = {
    select: (event) => {
      if (!props.graphEditMode) {
        // console.info("SELECT", event);
        let {nodes} = event;
        if (nodes.length > 0) {
          props.handleEntitySelection(nodes[0]);
        }
      }
    },
    click: (event) => {
      //if click is on an edge
      if (event.edges.length > 0 && event.nodes.length < 1 && props.canWriteEntityModel) {
        let connectedNodes = network.getConnectedNodes(event.edges[0]);
        let relationshipInfo = getRelationshipInfo(connectedNodes[0], connectedNodes[1], event);
        setNewRelationship(false);
        setSelectedRelationship(relationshipInfo);
        setOpenRelationshipModal(true);
      }
      if (clickedNode) {
        setClickedNode(undefined);
      }
    },

    dragStart: (event) => {
      if (!props.graphEditMode) {
        if (physicsEnabled) {
          setPhysicsEnabled(false);
        }
      }
    },
    dragEnd: async (event) => {
      let {nodes} = event;
      if (nodes.length > 0) {
        let positions = network.getPositions([nodes[0]])[nodes[0]];
        if (positions && positions.x && positions.y) {
          let newCoords = {...coords};
          let isConcept = false;
          if (props.hubCentralConfig?.modeling.hasOwnProperty("concepts")) {
            let concepts = props.hubCentralConfig?.modeling?.concepts || {};
            let conceptNodeObject = concepts[nodes[0]] || {};
            if (Object.keys(concepts).length > 0 && Object.keys(conceptNodeObject).length > 0) {
              isConcept = true;
            }
          }
          let modelCategory = getCategoryWithinModel(isConcept);
          let nodeCoordObject = newCoords["modeling"][modelCategory][nodes[0]] || {};
          if (!Object.keys(nodeCoordObject).length) {
            newCoords["modeling"][modelCategory][nodes[0]] = {graphX: positions.x, graphY: positions.y};
          } else {
            newCoords["modeling"][modelCategory][nodes[0]]["graphX"] = positions.x;
            newCoords["modeling"][modelCategory][nodes[0]]["graphY"] = positions.y;
          }

          setCoords(newCoords);
          props.updateHubCentralConfig(newCoords);
        }
      }
    },
    hoverNode: (event) => {
      event.event.target.style.cursor = "pointer";
    },
    blurNode: (event) => {
      event.event.target.style.cursor = "";
    },
    hoverEdge: (event) => {
      event.event.target.style.cursor = !props.canWriteEntityModel && props.canReadEntityModel ? "" : "pointer";
    },
    blurEdge: (event) => {
      event.event.target.style.cursor = "";
    },
    doubleClick: (event) => {
    },
    stabilized: (event) => {
      // NOTE if user doesn't manipulate graph on load, stabilize event
      // fires forever. This avoids reacting to infinite events
      if (hasStabilized) return;
      if (network && (userPreferences?.modelingGraphOptions?.physicsEnabled || !userPreferences?.modelingGraphOptions)) {
        let positions = network.getPositions();
        // When graph is stabilized, nodePositions no longer empty
        if (positions && Object.keys(positions).length) {
          if (!nodeCoordinatesExist()) {
            saveUnsavedCoords(positions);
          }
          setHasStabilized(true);
          if (physicsEnabled) {
            setPhysicsEnabled(false);
            setGraphPreferences({physicsEnabled: false});
            return false;
          }
        }
        if (modelingOptions.selectedEntity && selectedEntityExists()) {
          try { // Visjs might not have new entity yet, catch error
            network.selectNodes([modelingOptions.selectedEntity]);
          } catch (err) {
            console.error(err);
          }
        }
      }
    },
    oncontext: (event) => {
      let nodeId = network.getNodeAt(event.pointer.DOM);
      if (nodeId) {
        event.event.preventDefault();
        setMenuPosition({x: event.event.offsetX, y: event.event.offsetY});
        setClickedNode(nodeId);
      } else {
        setClickedNode(undefined);
      }
    },
    dragging: (event) => {
      if (clickedNode) {
        setClickedNode(undefined);
      }
    },
    zoom: async (event) => {
      let networkScale: any = await network.getScale();
      if (network) {
        if (networkScale >= graphConfig.scale.min) {
          network.moveTo({
            scale: graphConfig.scale.min
          });
        }
        if (networkScale <= graphConfig.scale.max) {
          network.moveTo({
            scale: graphConfig.scale.max
          });
        }
      }
      handleZoom(event, networkScale);
    },
    release: (event) => {
      if (!props.graphEditMode) {
        let targetClassName = event.event.target.className;
        let usingNavigationButtons = targetClassName || event.event.deltaX || event.event.deltaY ? true : false;
        let usingZoomButtons = targetClassName === "vis-button vis-zoomOut" || targetClassName === "vis-button vis-zoomIn";
        if (usingNavigationButtons && !usingZoomButtons) {
          updateConfigOnNavigation(event);
        }
      }
    }
  };

  const closeInvalidSourceAlert = () => {
    network.disableEditMode();
    props.setGraphEditMode(false);
    setInvalidSource(false);
  };

  const invalidAlert = () => <HCModal
    show={invalidSource}
    onHide={closeInvalidSourceAlert}
    dialogClassName={styles.dialog960w}
    centered
  >
    <Modal.Header className={"bb-none"}>
      <button type="button" className="btn-close" aria-label="closeInvalidSourceTypeAlert" onClick={closeInvalidSourceAlert}></button>
    </Modal.Header>
    <Modal.Body>
      <HCAlert
        className={`${styles.alert}`}
        variant="danger"
        showIcon
        key={"invalidSourceTypeError"}
        onClose={closeInvalidSourceAlert}
      >{"Invalid Relationship"}</HCAlert>
      <p aria-label="invalidSourceTypeError">{ModelingMessages.invalidSourceTypeError}</p>
    </Modal.Body>
  </HCModal>;

  return (
    <div id="graphVis">
      <div className={styles.graphContainer}>
        <Graph
          graph={graphData}
          options={options}
          events={events}
          getNetwork={initNetworkInstance}
        />
        {contextMenuVisible && menu()}
      </div>
      {invalidAlert()}
      {!invalidSource && <AddEditRelationship
        openRelationshipModal={openRelationshipModal}
        setOpenRelationshipModal={setOpenRelationshipModal}
        isEditing={!newRelationship}
        relationshipInfo={selectedRelationship}
        dataModel={props.dataModel}
        updateSavedEntity={props.updateSavedEntity}
        relationshipModalVisible={props.relationshipModalVisible}
        toggleRelationshipModal={props.toggleRelationshipModal}
        canReadEntityModel={props.canReadEntityModel}
        canWriteEntityModel={props.canWriteEntityModel}
        hubCentralConfig={props.hubCentralConfig}
        getColor={props.getColor}
        mapFunctions={mapFunctions}
      />}
    </div>
  );
};

export default GraphVis;
