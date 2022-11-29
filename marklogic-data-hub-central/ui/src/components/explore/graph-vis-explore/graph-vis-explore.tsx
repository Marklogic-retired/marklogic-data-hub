import React, {useState, useEffect, useContext, useLayoutEffect, createElement} from "react";
import styles from "./graph-vis-explore.module.scss";
import Graph from "react-graph-vis";
import graphConfig from "@config/graph-vis.config";
import * as _ from "lodash";
import {SearchContext} from "@util/search-context";
import {HubCentralConfigContext} from "@util/hubCentralConfig-context";
import {renderToStaticMarkup} from "react-dom/server";
import * as FontIcon from "react-icons/fa";
import {defaultIcon, defaultConceptIcon, graphViewConfig} from "@config/explore.config";
import tooltipsConfig from "@config/explorer-tooltips.config";
import {updateUserPreferences, getUserPreferences} from "../../../services/user-preferences";
import {UserContext} from "@util/user-context";
import {expandGroupNode} from "@api/queries";
import TableViewGroupNodes from "../table-view-group-nodes/table-view-group-nodes";
import {themeColors} from "@config/themes.config";
import {nodeType} from "types/explore-types";
import {AuthoritiesContext} from "@util/authorities";

type Props = {
  entityTypeInstances: any;
  graphView: any;
  viewRelationshipLabels: any;
  exportPngButtonClicked: boolean;
  setExportPngButtonClicked: any;
  setGraphPageInfo: (pageInfo: any) => void;
  viewConcepts: boolean;
  physicsAnimation: boolean;
  setIsLoading: (loading: boolean) => void;
  entityDefArray: any[];
  data:any[];
  openUnmergeCompare:(item: object)=>void;
  isUnmergeAvailable:(nodeId:string)=>boolean;
};

const GraphVisExplore: React.FC<Props> = (props) => {
  const {
    entityTypeInstances,
    graphView,
    viewRelationshipLabels,
    exportPngButtonClicked,
    setExportPngButtonClicked,
    setGraphPageInfo,
    viewConcepts,
    physicsAnimation,
    setIsLoading
  } = props;
  const [expandedNodeData, setExpandedNodeData] = useState({});
  let graphData = {nodes: [], edges: []};
  const [menuPosition, setMenuPosition] = useState<{x: number, y: number}>({x: 0, y: 0});
  const [physicsEnabled, setPhysicsEnabled] = useState(false);
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [clickedNode, setClickedNode] = useState({});
  const [hasStabilized, setHasStabilized] = useState(false);


  const authorityService = useContext(AuthoritiesContext);
  const canReadMatchMerge = authorityService.canReadMatchMerge();

  const {
    searchOptions,
    setGraphViewOptions,
    savedNode,
    setSavedNode,
    entityInstanceId
  } = useContext(SearchContext);
  const {
    user
  } = useContext(UserContext);
  const {hubCentralConfig} = useContext(HubCentralConfigContext);

  // Get network instance on init
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setIsLoading(false);
    setNetwork(networkInstance);
  };

  const [networkHeight, setNetworkHeight] = useState(graphConfig.defaultOptions.height);
  const vis = require("vis-network/standalone/umd/vis-network"); //eslint-disable-line @typescript-eslint/no-unused-vars

  const [graphDataLoaded, setGraphDataLoaded] = useState(false);

  const {handleError} = useContext(UserContext);
  const [groupNodes, setGroupNodes] = useState({});
  const [leafNodes, setLeafNodes] = useState({});
  const [predicates, setPredicates] = useState({});

  const [openTableViewForGroupNodes, toggleTableViewForGroupNodes] = useState(false);
  const [relatedToData, setRelatedToData] = useState({});
  const [nodesDefocussed, setNodesDefocussed] = useState<any[]>([]);

  const updateNodesData = (nodes) => {
    network.body.data.nodes.update(nodes);
  };
  const updateEdgesData = (edges) => {
    network.body.data.edges.update(edges);
  };

  const clearGraphData = () => {
    let removedIds = network.body.data.nodes.getIds();
    let removededgeIds = network.body.data.edges.getIds();
    network.body.data.nodes.remove(removedIds);
    network.body.data.edges.remove(removededgeIds);
  };

  const getEdgePredicate = (nodeId, network) => {
    let edges: any = [];
    if (network) {
      edges = network.getConnectedEdges(nodeId);
    }
    let edgeId = edges && edges.length > 0 && edges[0];

    return predicates[edgeId];
  };

  const initializeGraphData = () => {
    try {
      clearGraphData();
    } catch (err) {
      console.error("Error clearing the graph data before reset.");
    } finally {

      //**turn this back on to investigate how to show loading while nodes are bouncing/stabilizing**/
      // setIsLoading(true);
      //****************************** */

      updateNodesData(getNodes());
      updateEdgesData(getEdges());
      setExpandedNodeData({});
      setGraphDataLoaded(true);
    }
  };

  useEffect(() => {
    if (Object.keys(entityTypeInstances).length && network) {

      initializeGraphData();

      const updateGraphSettings = async () => {
        await updateNetworkHeight();
      };

      //Initialize graph view position
      if (network) {
        updateGraphSettings();
        updateGraphPageInfo();
      }
    }
    return () => {
      setGraphDataLoaded(false);
    };

  }, [entityTypeInstances, viewRelationshipLabels, hubCentralConfig, viewConcepts]);

  useEffect(() => {
    if (network && graphView) {
      let nodes = getNodes() || [];
      let edges = getEdges() || [];
      updateNodesData(nodes);
      updateEdgesData(edges);
      const updateGraphSettings = async () => {
        await updateNetworkHeight();
      };

      //Initialize graph zoom scale and view position
      if (network) {
        updateGraphSettings();
      }
    }
    return () => {
      setClickedNode({});
      setExpandedNodeData({});
      setPredicates({});
      setGroupNodes({});
      setLeafNodes({});
      setNodesDefocussed([]);
    };

  }, [network, graphView]);

  useEffect(() => {
    if (exportPngButtonClicked) {
      let canvas = document.getElementsByClassName("vis-network")[0]["canvas"];
      let link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.setAttribute("download", "graph-view-explore");
      document.body.appendChild(link);
      link.click();
      setExportPngButtonClicked(false);
    }
  }, [exportPngButtonClicked]);

  useLayoutEffect(() => {
    if (network) {
      window.graphVisExploreApi = {
        getNodePositions: (nodeIds?: any) => { return !nodeIds ? network.getPositions() : network.getPositions(nodeIds); },
        canvasToDOM: (xCoordinate, yCoordinate) => { return network.canvasToDOM({x: xCoordinate, y: yCoordinate}); },
        focus: (nodeId: any) => { network.focus(nodeId); },
        fit: () => { network.fit(); },
        stopStabilization: () => { network.stopSimulation(); },
      };
    }
  }, [network, graphData]);

  const setUserPreferences = () => {
    let defaultPreferences = getUserPreferences(user.name);
    if (defaultPreferences !== null) {
      let parsedPreferences = JSON.parse(defaultPreferences);
      let preferencesObject = {
        ...parsedPreferences,
        graphViewOptions: {
          groupNodeId: clickedNode["nodeId"],
          parentIRI: clickedNode["docIRI"],
          predicateFilter: clickedNode["predicate"]
        }
      };
      updateUserPreferences(user.name, preferencesObject);
    }
  };

  useEffect(() => {
    if (network && entityInstanceId && graphDataLoaded) {
      let parentNodes = network.getConnectedNodes(entityInstanceId, "from");
      let predicate = getEdgePredicate(entityInstanceId, network);
      let parentNode = parentNodes[0];
      let expandId = parentNode + "-" + predicate;
      let selectedEntityExists = false;
      if (parentNode && expandedNodeData[expandId]) {
        selectedEntityExists = expandedNodeData[expandId]?.nodes?.some(node => node.id === entityInstanceId);
      } else {
        selectedEntityExists = entityTypeInstances?.nodes?.some(node => node.id === entityInstanceId);
      }
      if (selectedEntityExists) {
        setPhysicsEnabled(false);
        network.selectNodes([entityInstanceId]);
      } else {
        setGraphViewOptions(undefined);
      }
    } else if (network && entityInstanceId && !graphDataLoaded && savedNode) { //case where exploring from table/snippet view
      let instanceId = entityInstanceId.split("-")[1];
      let selectedEntity = entityTypeInstances?.nodes?.find(node => node.id.includes(instanceId));
      if (selectedEntity) {
        setPhysicsEnabled(false);
        network.selectNodes([selectedEntity.id]);
      } else {
        setGraphViewOptions(undefined);
      }
    }
  }, [network && entityInstanceId]);

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

  const isExpandedLeaf = (nodeId?) => {
    let expandId = "";
    if (!nodeId) {
      expandId = clickedNode["nodeId"];
    } else {
      expandId = nodeId;
    }
    return expandedNodeData.hasOwnProperty(expandId) && !expandedNodeData[expandId].hasOwnProperty("removedNode");
  };

  const createTitleWithPropertiesOnHover = propertiesOnHover => {
    const container = document.createElement("div");
    const paddingElementes = document.createElement("div");
    const topSpan = document.createElement("div");
    const bottomSpan = document.createElement("div");
    propertiesOnHover.forEach(property => {
      Object.keys(property).forEach(propertyName => {
        const propertySpan = document.createElement("span");
        if (typeof property[propertyName] === "string" || typeof property[propertyName] === "number") {
          propertySpan.innerHTML = `${propertyName.replaceAll(".", " > ")}: ${property[propertyName]}`;
          topSpan.appendChild(propertySpan);
          topSpan.appendChild(document.createElement("br"));
        } else {
          propertySpan.innerHTML = `${propertyName.replaceAll(".", " > ")}:`;
          const pre = document.createElement("pre");
          pre.innerText = JSON.stringify(property[propertyName], undefined, 2);
          paddingElementes.appendChild(propertySpan);
          paddingElementes.appendChild(pre);
        }
      });
    });
    bottomSpan.innerText = tooltipsConfig.graphVis.singleNodeNoLabel;
    container.appendChild(topSpan);
    container.appendChild(paddingElementes);
    container.appendChild(bottomSpan);
    return container;
  };

  const getNodes = (nodesToExpand?: any) => {
    let nodes: Array<nodeType> = [];
    let nodeObj = groupNodes;
    let leafNodesObj = leafNodes;
    let entityInstNodes = entityTypeInstances?.nodes?.slice();
    entityInstNodes = !nodesToExpand ? entityInstNodes : nodesToExpand;
    entityInstNodes.forEach((e) => {
      if (!viewConcepts) {
        if (e.isConcept) {
          return;
        }
      }
      let entityType = e.group.split("/").pop();
      let entity: any = {};
      if (!e.isConcept) {
        entity = hubCentralConfig?.modeling?.entities[entityType];
      } else {
        let conceptClassName = e.conceptClassName;
        if (conceptClassName && hubCentralConfig?.modeling?.concepts[conceptClassName]) {
          entity = hubCentralConfig?.modeling?.concepts[conceptClassName];
        }
      }
      let iconName = entity?.icon || (e.isConcept ? defaultConceptIcon : defaultIcon);
      let defaultThemeColor = !e.isConcept ? themeColors.defaults.entityColor : themeColors.defaults.conceptColor;
      let nodeColor = entity?.color || defaultThemeColor;
      let nodeId = e.id;
      let nodeTitle: string | HTMLElement = tooltipsConfig.graphVis.singleNodeNoLabel;
      if (e.count > 1) {
        if (!nodeObj.hasOwnProperty(nodeId)) {
          nodeObj[nodeId] = e;
        }
      }
      let tempLabel = e.label !== "" ? e.label : (e.docUri || nodeId);
      let nodeLabel = tempLabel.length > 9 ? tempLabel.substring(0, 6) + "..." : tempLabel;
      if (e.hasRelationships) {
        if (!leafNodesObj.hasOwnProperty(nodeId)) {
          leafNodesObj[nodeId] = e;
        }
      }
      // get node title
      if (e.count > 1) {
        nodeTitle = tooltipsConfig.graphVis.groupNode(entityType);
      } else if (e.propertiesOnHover?.length) {
        nodeTitle = createTitleWithPropertiesOnHover(e.propertiesOnHover);
      } else if (e.label.length > 0) {
        nodeTitle = tooltipsConfig.graphVis.singleNode(e.label);
      }
      nodes.push({
        id: nodeId,
        shape: "custom",
        title: nodeTitle,
        label: nodeLabel,
        color: nodeColor,
        ctxRenderer: ({ctx, x, y, state: {selected, hover}, style, label}) => {
          const r = style.size;
          const color = style.color;
          const drawNode = () => {
            let scale = graphConfig.sampleMetadata?.modeling?.scale ? graphConfig.sampleMetadata?.modeling?.scale : 0.5;
            if (network) {
              scale = network.getScale();
            }
            let displayLabel = scale > 0.6;
            let radiusByCount = r + ((e.count / 10) * 5);
            let maxRadius = 84;
            let rad = e.count > 10 ? (radiusByCount >= 84 ? maxRadius : radiusByCount) : r;
            const radius = displayLabel ? rad * 1.5 : rad;
            const imagePositionY = displayLabel ? y - 25 : y - 15;
            let backgroundColor = hover ? themeColors.defaults.hoverColor : color;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = backgroundColor;
            ctx.fill();
            ctx.lineWidth = 0.01;
            if (e.isConcept && !selected) {
              ctx.strokeStyle = themeColors["text-color-secondary"];
              ctx.lineWidth = 2;
            }
            if (selected) {
              ctx.strokeStyle = themeColors.info;
              ctx.lineWidth = 4;
            }
            ctx.stroke();
            let defaultColor = !e.isConcept ? "Black" : themeColors["text-color-secondary"];
            if (displayLabel) {
              let customLabel = e.count >= 2 ? entityType : nodeLabel;
              ctx.font = "14px Helvetica Neue";
              ctx.fillStyle = defaultColor;
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(customLabel, x, y + 10);
            }
            if (scale > 0.3 && scale < 0.6) {
              let img = new Image();   // Create new img element
              img.src = `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(FontIcon[iconName])))}`;
              //Drawing the image on canvas
              ctx.fillStyle = defaultColor;
              ctx.drawImage(img, x - 12, imagePositionY, 24, 24);
            } else if (scale > 0.6) {
              let img = new Image();   // Create new img element
              img.src = `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(FontIcon[iconName])))}`;
              //Drawing the image on canvas
              ctx.fillStyle = defaultColor;

              ctx.drawImage(img, x - 12, imagePositionY, 24, 24);
              let customLabel = e.count >= 2 ? entityType : nodeLabel;
              ctx.fillText(customLabel, x, y + 10);

              if (e.hasRelationships) {
                let imgLeaf = new Image();
                imgLeaf.src = `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(FontIcon["FaProjectDiagram"])))}`;
                ctx.drawImage(imgLeaf, x - 7, y + 18, 14, 14);
              }
            }
            if (e.count >= 2 && displayLabel) {
              //Creating the group node badge
              let updatedX = x + (rad < 84 ? radius * Math.sin(60) : rad * Math.sin(45));
              let xOffset = rad < 84 ? 28 : -28;
              let badgeCoordinateX = updatedX + xOffset;
              let updatedY = y + radius * Math.cos(60);
              let badgeCoordinateY = updatedY - 5;
              let countString = ctx.measureText(e.count.toString());
              let countWidth = (countString.width < 16 ? 16 : countString.width) + 7;
              roundedRect(ctx, badgeCoordinateX, badgeCoordinateY, countWidth, 20, 5);

              //Adding the count in the badge
              ctx.fill();
              ctx.fillStyle = "#FFFFFF";
              let textLength = e.count.toString().length;
              let textLengthOffset = textLength > 1 ? 4 : 7;
              let textCoordinateX = badgeCoordinateX + textLengthOffset;
              let textCoordinateY = updatedY + 6;
              ctx.textAlign = "left";
              ctx.fillText(e.count, textCoordinateX, textCoordinateY);
            }
          };
          const roundedRect = (ctx, x, y, width, height, radius) => {
            ctx.beginPath();
            ctx.moveTo(x, y + radius);
            ctx.arcTo(x, y + height, x + radius, y + height, radius);
            ctx.arcTo(x + width, y + height, x + width, y + height - radius, radius);
            ctx.arcTo(x + width, y, x + width - radius, y, radius);
            ctx.arcTo(x, y, x, y + radius, radius);
            ctx.stroke();
            ctx.fillStyle = graphViewConfig.groupNodeBadgeColor;
          };

          return {
            drawNode,
            nodeDimensions: {width: 2.5 * r, height: 2.5 * r},
          };
        }
      });
    });
    setGroupNodes(nodeObj);
    setLeafNodes(leafNodesObj);
    return nodes;
  };

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

  const getEdges = (edgesToExpand?: any) => {
    let edges: any = [];
    let addedEdges: any = [];
    let predicatesObject = predicates;
    let smoothOpts;
    let edgesFinal: any = entityTypeInstances?.edges?.slice();
    edgesFinal = !edgesToExpand ? edgesFinal : edgesToExpand;
    edges = edgesFinal?.map((edge, i) => {
      if (!predicatesObject.hasOwnProperty(edge.id)) {
        predicatesObject[edge.id] = edge.predicate;
      }
      smoothOpts = getSmoothOpts(edge.to, edge.from, addedEdges);
      addedEdges.push(edge);
      return {
        ...edge,
        id: edge.id,
        label: viewRelationshipLabels ? edge.label : "",
        arrows: {
          to: {
            enabled: false,
          }
        },
        color: {
          color: "#666",
          highlight: themeColors.defaults.hoverColor,
          hover: themeColors.defaults.hoverColor,
        },
        font: {
          align: "top",
        },
        smooth: smoothOpts
      };
    });
    setPredicates(predicatesObject);
    return edges;
  };

  const options = {
    ...graphConfig.defaultOptions,
    height: networkHeight,
    autoResize: true,
    physics: {
      enabled: physicsAnimation,
      forceAtlas2Based: {
        gravitationalConstant: -26,
        centralGravity: 0.005,
        springLength: 230,
        springConstant: 0.18,
        avoidOverlap: 1
      },
      maxVelocity: 146,
      solver: "forceAtlas2Based",
      timestep: 0.35,
      stabilization: {
        enabled: true,
        iterations: 2000,
        updateInterval: 25,
      },
    },
    interaction: {
      navigationButtons: true,
      hover: true,
      zoomView: false
    },
    manipulation: {
      enabled: false
    },
  };

  const updateGraphDataWith = async (nodes, edges) => {
    let graphDataTemp: any = graphData;
    graphDataTemp.nodes = getNodes(nodes);
    graphDataTemp.edges = getEdges(edges);
    network.body.data.nodes.remove(graphDataTemp.nodes);
    updateNodesData(graphDataTemp.nodes);
    updateEdgesData(graphDataTemp.edges);
    updateGraphPageInfo();
  };

  const handleTableViewRecords = (exceededThreshold?: string) => {
    if (network) {
      const selectedNodeType = clickedNode && clickedNode["nodeId"] ? clickedNode["nodeId"].split("/").pop().split("-").pop() : undefined;
      const predicate = clickedNode && clickedNode["predicateIri"];
      const {nodeObject} = clickedNode && clickedNode["parentNode"] && getExpandedNodeObject(clickedNode["parentNode"]);
      const parentNode = nodeObject["docIRI"];
      const relatedView = {
        entityTypeId: selectedNodeType,
        predicateFilter: predicate,
        parentNode: parentNode
      };
      if (exceededThreshold) {
        relatedView["exceededThreshold"] = true;
      }

      setRelatedToData(relatedView);
      toggleTableViewForGroupNodes(true);
    }
  };

  const updateGroupAndLeafNodesDataset = async (expandedNodes) => {
    let groupNodeObj = groupNodes;
    let leafNodeObj = leafNodes;
    expandedNodes.forEach(e => {
      if (e.count > 1) {
        if (!groupNodeObj.hasOwnProperty(e.id)) {
          groupNodeObj[e.id] = e;
        }
      }
      if (e.hasRelationships) {
        if (!leafNodeObj.hasOwnProperty(e.id)) {
          leafNodeObj[e.id] = e;
        }
      }
    });
    setGroupNodes(groupNodeObj);
    setLeafNodes(leafNodeObj);
  };

  const updateGraphPageInfo = (nodesToHide=[]) => {
    const hiddenNodesCount = nodesToHide.length;
    const visibleNodesCount = network.body.data.nodes.length - hiddenNodesCount;

    const total = network.body.data.nodes.length < entityTypeInstances.total ? entityTypeInstances.total : network.body.data.nodes.length;

    let pageInfo = {
      pageLength: visibleNodesCount || 0,
      total: total
    };
    setGraphPageInfo(pageInfo);
  };

  const handleGroupNodeExpand = async (payloadData) => {
    setContextMenuVisible(false);
    let parentDoc = null;
    let nodeId = null;
    if (payloadData && payloadData.nodeInfo) {
      if (!parentDoc) {
        parentDoc = payloadData.nodeInfo["parentNode"];
      }
      if (!nodeId) {
        nodeId = payloadData.nodeInfo["nodeId"];
      }
    }
    let payload = {
      database: searchOptions.database,
      data: {
        parentIRI: parentDoc || nodeId,
        "predicateFilter": payloadData.nodeInfo["predicateIri"]
      }
    };
    try {
      let response: any;
      let checkThreshold = false;
      if (!payloadData.expandAll) {
        response = await expandGroupNode(payload, 3);
      } else {
        response = await expandGroupNode(payload);
        checkThreshold = true;
      }

      if (response.status === 200) {
        if (checkThreshold && response.data.total > 1000) {
          handleTableViewRecords("exceededThreshold");
        } else {
          let expandedNodeInfo = expandedNodeData;
          let expandId = payloadData["nodeInfo"] ? payloadData.nodeInfo["nodeId"] : clickedNode["nodeId"];
          expandedNodeInfo[expandId] = {
            nodes: response.data.nodes,
            edges: response.data.edges,
            removedNode: nodeId,
          };
          setExpandedNodeData(expandedNodeInfo);
          network.body.data.nodes.remove(nodeId);
          await updateGroupAndLeafNodesDataset(response.data.nodes);
          await updateGraphDataWith(response.data.nodes, response.data.edges);
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleCollapse = async () => {
    try {
      let nodeId = clickedNode["nodeId"];
      let expandId;
      for (let key in expandedNodeData) {
        let expandedNode = expandedNodeData[key];
        let nodes = expandedNode["nodes"];
        let nodeIds = nodes.map(node => node["id"]);
        if (nodeIds.includes(nodeId) && expandedNodeData[key]["removedNode"]) {
          expandId = key;
          break;
        }
      }
      let expandedGroupNodeObject = expandedNodeData[expandId];
      let graphNodesDataTemp = expandedGroupNodeObject?.nodes.map(e => e["id"]);
      let graphEdgesDataTemp = expandedGroupNodeObject?.edges.map(e => e["id"]);
      let removedNodeIRI = expandedGroupNodeObject?.removedNode;

      let tempExpandedData = {...expandedNodeData};
      if (tempExpandedData && tempExpandedData[expandId]) {
        delete tempExpandedData[expandId];
      }
      setExpandedNodeData(tempExpandedData);
      network.body.data.nodes.remove(graphNodesDataTemp);
      network.body.data.edges.remove(graphEdgesDataTemp);
      let removedNode = getNodes([groupNodes[removedNodeIRI]]);
      updateNodesData(removedNode);
      updateGraphPageInfo();
    } catch (error) {
      handleError(error);
    }
  };

  const getExpandedNodeIdsToRemove = (leafNodeExpandId, nodeIdsToRemove: any[] = [], _MainNodeID) => {
    if (expandedNodeData[leafNodeExpandId]) {
      let expandedGroupNodeObject = expandedNodeData[leafNodeExpandId];
      expandedGroupNodeObject.nodes.forEach(e => {
        let expandId: any = e["id"];
        if (expandId && expandId !== _MainNodeID && !nodeIdsToRemove.includes(expandId)) {
          nodeIdsToRemove.push(expandId);
          if (clickedNode && clickedNode["isConcept"]) {
            nodeIdsToRemove.push(expandId);
          }
          return getExpandedNodeIdsToRemove(expandId, nodeIdsToRemove, _MainNodeID);
        }
      });
    }
    return nodeIdsToRemove;
  };

  const getExpandedEdgeIdsToRemove = (leafNodeExpandId, edgeIdsToRemove: any[] = []) => {
    if (expandedNodeData[leafNodeExpandId]) {
      let expandedGroupNodeObject = expandedNodeData[leafNodeExpandId];
      const edgesToRemove = expandedGroupNodeObject.edges.filter(e => e["from"] === leafNodeExpandId || e["to"] === leafNodeExpandId);
      edgesToRemove.forEach(e => {
        let id: any = e["id"];
        edgeIdsToRemove.push(id);
      });
    }
    return edgeIdsToRemove;
  };

  const handleLeafNodeCollapse = () => {
    try {
      let graphNodesDataTemp: any = getExpandedNodeIdsToRemove(clickedNode["nodeId"], [], clickedNode["nodeId"]);

      let graphEdgesDataTemp = getExpandedEdgeIdsToRemove(clickedNode["nodeId"]);
      let tempExpandedData = expandedNodeData;
      graphNodesDataTemp.forEach(expandId => delete tempExpandedData[expandId]);
      delete tempExpandedData[clickedNode["nodeId"]];
      setExpandedNodeData(tempExpandedData);
      network.body.data.nodes.remove(graphNodesDataTemp);
      network.body.data.edges.remove(graphEdgesDataTemp);
      updateGraphPageInfo();
    } catch (error) {
      handleError(error);
    }
  };

  const handleLeafNodeExpansion = async (payloadData) => {
    setContextMenuVisible(false);
    let parentIRI = null;
    if (clickedNode) {
      parentIRI = clickedNode["docUri"] || clickedNode["nodeId"];
    }
    if (!parentIRI && payloadData && payloadData.nodeInfo) {
      parentIRI = payloadData.nodeInfo["docUri"] || payloadData.nodeInfo["nodeId"];
    }
    let payload = {
      database: searchOptions.database,
      data: {
        parentIRI
      }
    };
    if (clickedNode && clickedNode["isConcept"]) {
      payload["data"]["isConcept"] = true;
      payload["data"]["parentIRI"] = clickedNode["docIRI"];
      payload["data"]["objectConcept"] = clickedNode["nodeId"];
    }
    try {
      let response: any;
      if (!payloadData.expandAll) {
        response = await expandGroupNode(payload, 3);
      } else {
        response = await expandGroupNode(payload);
      }

      if (response.status === 200) {
        let expandedNodeInfo = expandedNodeData;
        let expandId = payloadData["nodeInfo"] ? payloadData.nodeInfo["nodeId"] : clickedNode["nodeId"];
        let cleanedNode: string[] = [];

        let filteredNodes = response.data.nodes.filter(node => {
          if (node.count && node.count > 1) {
            const group = node.group;
            if (group) {
              const entityGroup = group.split("/").pop();
              if (searchOptions.entityTypeIds.includes(entityGroup)) {
                cleanedNode.push(node["id"]);
                return false;
              }
            }
          }

          if (expandedNodeInfo[node.id]) {
            cleanedNode.push(node["id"]);
            return false;
          }
          if (network.body.data.nodes.get(node["id"])) {
            cleanedNode.push(node["id"]);
            return false;
          }
          return true;
        });

        let filteredEdges = response.data.edges.filter(edge => {
          if (cleanedNode.includes(edge.from) || cleanedNode.includes(edge.to)) {
            if (network.body.data.edges.get(edge["id"])) {
              return false;
            }
          }
          return true;
        });
        expandedNodeInfo[expandId] = {
          nodes: filteredNodes,
          edges: filteredEdges,
        };
        setExpandedNodeData(expandedNodeInfo);
        let nodes = getNodes(filteredNodes);
        let edges = getEdges(filteredEdges);
        network.body.data.nodes.update(nodes);
        network.body.data.edges.update(edges);
        await updateGroupAndLeafNodesDataset(filteredNodes);
        updateGraphPageInfo();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const resetSavedNode = () => {
    if (savedNode) {
      setSavedNode(undefined);
      network.unselectAll();
    }
  };

  const handleClusterFocus = () => {
    let clickedNodeId = clickedNode && clickedNode["nodeId"];
    const getNodesInCluster = (nodeId: string, nodesInCluster = {}) => {
      if (nodesInCluster[nodeId]) {
        return nodesInCluster;
      }
      let nodeIds = network.getConnectedNodes(nodeId);
      nodesInCluster[nodeId] = "covered";
      if (nodeIds.length) {
        nodeIds.forEach(nodeId => {
          getNodesInCluster(nodeId, nodesInCluster);
        });
      }
      return nodesInCluster;
    };

    let nodesInCluster = getNodesInCluster(clickedNodeId);
    let nodesToHide = network.body.data.nodes.get({
      filter: (node) => !nodesInCluster.hasOwnProperty(node.id)
    });
    nodesToHide.forEach(node => node["hidden"] = true);
    setNodesDefocussed(nodesToHide);
    resetSavedNode();
    updateNodesData(nodesToHide);
    updateGraphPageInfo(nodesToHide);
  };

  const handleDefocusCluster = () => {
    nodesDefocussed.forEach(node => node["hidden"] = false);
    resetSavedNode();
    updateNodesData(nodesDefocussed);
    setNodesDefocussed([]);
    updateGraphPageInfo();
  };

  const handleMenuClick = async (event) => {
    setContextMenuVisible(false);
    if (network) {
      switch (event.target.id) {
      case "viewRecordsInTableView":
        handleTableViewRecords();
        break;
      case "focusOnCluster":
        handleClusterFocus();
        break;
      case "defocus":
        handleDefocusCluster();
        break;
      case "showRelated": {
        let payloadData = {expandAll: true};
        await handleLeafNodeExpansion(payloadData);
        setUserPreferences();
        break;
      }
      case "expand3SampleRecords": {
        const {edgeObject} = getExpandedNodeObject(clickedNode["nodeId"]);
        let nodeInfo = getNodeObject(clickedNode["nodeId"], edgeObject);
        let payloadData = {expandAll: false, nodeInfo: nodeInfo};
        await handleGroupNodeExpand(payloadData);
        setUserPreferences();
        break;
      }
      case "expandAllRecords": {
        const {edgeObject} = getExpandedNodeObject(clickedNode["nodeId"]);
        let nodeInfo = getNodeObject(clickedNode["nodeId"], edgeObject);
        let payloadData = {expandAll: true, nodeInfo: nodeInfo};
        handleGroupNodeExpand(payloadData);
        setUserPreferences();
        break;
      }
      case "collapseRecords":
        handleCollapse();
        setUserPreferences();
        break;
      case "collapseLeafNode":
        handleLeafNodeCollapse();
        setUserPreferences();
        break;
      case "centerNode": {
        await network.focus(clickedNode["nodeId"]);
        break;
      }
      case "Unmerge": {
        const filteredData= props.data.filter((item) => item["uri"] === clickedNode["nodeId"]);
        if (filteredData.length >0 && canReadMatchMerge) {
          props.openUnmergeCompare(filteredData[0].uri);
        }
        break;
      }
      }
    }
  };

  const isExpandedChildNode = () => {
    let expandedNodeIds = Object.keys(expandedNodeData);
    if (expandedNodeIds.length === 0) {
      return false;
    } else {
      let nodeId = clickedNode["nodeId"];
      let groupId;
      for (let key in expandedNodeData) {
        let expandedNode = expandedNodeData[key];
        let nodes = expandedNode["nodes"];
        let nodeIds = nodes.map(node => node["id"]);
        if (nodeIds.includes(nodeId) && expandedNodeData[key]["removedNode"]) {
          groupId = key;
          break;
        }
      }

      if (groupId && expandedNodeData[groupId]) {
        return true;
      } else {
        return false;
      }
    }
  };

  const isGroupNode = () => {
    return clickedNode["isGroupNode"];
  };

  const nodeIdExists = () => {
    return clickedNode && clickedNode["nodeId"];
  };

  const isLeafNode = () => {
    const nodeId = clickedNode["leafExpandId"] ? clickedNode["leafExpandId"] : clickedNode["nodeId"];
    return clickedNode && !isGroupNode() && !expandedNodeData.hasOwnProperty(nodeId) && clickedNode["hasRelationships"];
  };

  const isClusterFocused = () => {
    return !!nodesDefocussed.length;
  };

  const menu = () => {
    let entityType = "";
    if (!nodeIdExists()) {
      return null;
    }
    if (groupNodes && groupNodes[clickedNode["nodeId"]]) {
      entityType = groupNodes[clickedNode["nodeId"]].group.split("/").pop();
    } else {
      entityType = clickedNode && clickedNode["entityName"] ? clickedNode["entityName"] : "";
    }
    return (
      <div id="contextMenu" onClick={handleMenuClick} className={styles.contextMenu} style={{left: menuPosition.x, top: menuPosition.y}}>
        {isGroupNode() &&
          <div id="viewRecordsInTableView" key="1" className={styles.contextMenuItem}>
            Open related {entityType} records in a table
          </div>
        }
        {isLeafNode() &&
          <div id="showRelated" key="2" className={styles.contextMenuItem}>
            Show related
          </div>
        }
        {isGroupNode() && !isExpandedChildNode() && clickedNode["count"] > 3 &&
          <div id="expand3SampleRecords" key="3" className={styles.contextMenuItem}>
            Expand 3 {entityType} records from this group
          </div>
        }
        {isGroupNode() &&
          <div id="expandAllRecords" key="4" className={styles.contextMenuItem}>
            Expand all {entityType} records in this group
          </div>
        }
        {isExpandedChildNode() &&
          <div id="collapseRecords" key="5" className={styles.contextMenuItem}>
            Collapse all {entityType} records into a group
          </div>
        }
        {isExpandedLeaf() &&
          <div id="collapseLeafNode" key="6" className={styles.contextMenuItem}>
            Collapse related
          </div>
        }
        {!isClusterFocused() &&
          <div id="focusOnCluster" key="7" className={styles.contextMenuItem}>
            Show only records in this cluster
          </div>
        }
        {isClusterFocused() &&
          <div id="defocus" key="8" className={styles.contextMenuItem}>
            Show all records
          </div>
        }
        {props.isUnmergeAvailable(clickedNode["nodeId"]) &&
          <div id="Unmerge" key="9" className={styles.contextMenuItem} data-testid="UnmergeOption">
            Unmerge this record
          </div>
        }
        <div id="centerNode" key="10" className={styles.contextMenuItem}>
          Center this record
        </div>
      </div>
    );
  };

  useEffect(() => {
    if (clickedNode && clickedNode["nodeId"]) {
      setContextMenuVisible(true);
    } else {
      setContextMenuVisible(false);
    }
  }, [clickedNode]);

  const getExpandedNodeObject = (nodeId) => {
    let expandedInstanceInfo = {nodeObject: {}, edgeObject: {}, currentNodeExpandId: "", parentNodeExpandId: ""};

    let expandId;
    for (let key in expandedNodeData) {
      let expandedNode = expandedNodeData[key];
      let nodes = expandedNode["nodes"];
      let nodeIds = nodes.map(node => node["id"]);
      if (nodeIds.includes(nodeId)) {
        expandId = key;
        break;
      }
    }

    if (expandId && expandedNodeData[expandId]) {
      expandedInstanceInfo["nodeObject"] = expandedNodeData[expandId].nodes.find(node => node.id === nodeId);
      expandedInstanceInfo["edgeObject"] = expandedNodeData[expandId].edges.find(edge => edge.to === nodeId || edge.from === nodeId);
      expandedInstanceInfo["parentNodeExpandId"] = expandId;
    } else {
      expandedInstanceInfo["nodeObject"] = entityTypeInstances.nodes.find(node => node.id === nodeId);
      expandedInstanceInfo["edgeObject"] = entityTypeInstances.edges.find(edge => edge.to === nodeId || edge.from === nodeId);
    }
    return expandedInstanceInfo;
  };

  const handleSelect = _.debounce(async (event) => {
    const {nodes} = event;
    if (nodes.length > 0) {
      const [node] = nodes;
      const nodeId = node;
      const {nodeObject, edgeObject, currentNodeExpandId, parentNodeExpandId} = getExpandedNodeObject(nodeId);
      if (groupNodes.hasOwnProperty(nodeId)) {
        let nodeInfo = getNodeObject(nodeId, edgeObject);
        nodeInfo["entityName"] = nodeObject && nodeObject["group"] ? nodeObject["group"].split("/").pop() : "";
        nodeInfo["hasRelationships"] = nodeObject && nodeObject["hasRelationships"] ? nodeObject["hasRelationships"] : false;
        nodeInfo["count"] = nodeObject && nodeObject["count"] ? nodeObject["count"] : 1;
        nodeInfo["currentNodeExpandId"] = currentNodeExpandId;
        nodeInfo["parentNodeExpandId"] = parentNodeExpandId;

        //Reset ClickedNode upon double click
        setClickedNode({nodeId: undefined, isGroupNode: false});

        let payloadData = {
          expandAll: false,
          nodeInfo: nodeInfo
        };
        await handleGroupNodeExpand(payloadData);
        setUserPreferences();
      } else {
        if (nodeObject) {
          setSavedNode(nodeObject);
        } else {
          const nodeObject = entityTypeInstances.nodes.find(node => node.id === nodeId);
          setSavedNode(nodeObject);
        }
        setGraphViewOptions(node);
      }
    }
  }, 400);

  let doubleClick = false;

  const handleClick = (event) => {
    setTimeout(() => {
      if (!doubleClick) {
        onClick(event);
      } else {
        doubleClick = false;
      }
    }, 400);
  };

  const onClick = (event) => {
    if (event.nodes.length > 0 && event.event.tapCount === 1 && event.event.type === "tap") {
      handleSelect(event);
    }
    //if click is on an edge
    if (event.edges.length > 0 && event.nodes.length < 1) {
      //let connectedNodes = network.getConnectedNodes(event.edges[0]);
      //Add node click actions here
    }
    if (clickedNode && clickedNode["nodeId"]) {
      let nodeInfo = {
        nodeId: undefined,
        isGroupNode: false
      };
      setClickedNode(nodeInfo);
    }
  };

  const handleDoubleClick = (event) => {
    doubleClick = true;
    const {nodes} = event;
    if (nodes.length > 0) {
      const [nodeId] = nodes;
      const {nodeObject, edgeObject, currentNodeExpandId, parentNodeExpandId} = getExpandedNodeObject(nodeId);
      let nodeInfo = getNodeObject(nodeId, edgeObject);
      nodeInfo["entityName"] = nodeObject && nodeObject["group"] ? nodeObject["group"].split("/").pop() : "";
      nodeInfo["hasRelationships"] = nodeObject && nodeObject["hasRelationships"] ? nodeObject["hasRelationships"] : false;
      nodeInfo["count"] = nodeObject && nodeObject["count"] ? nodeObject["count"] : 1;
      nodeInfo["currentNodeExpandId"] = currentNodeExpandId;
      nodeInfo["parentNodeExpandId"] = parentNodeExpandId;
      nodeInfo["docUri"] = nodeObject && nodeObject["docUri"] ? nodeObject["docUri"] : "";
      nodeInfo["docIRI"] = nodeObject && nodeObject["docIRI"] ? nodeObject["docIRI"] : "";
      nodeInfo["parentDocUri"] = nodeObject && nodeObject["parentDocUri"] ? nodeObject["parentDocUri"] : "";
      nodeInfo["predicateIri"] = nodeObject && nodeObject["predicateIri"] ? nodeObject["predicateIri"] : nodeInfo["predicateIri"];

      //Reset ClickedNode upon double click
      setClickedNode({nodeId: undefined, isGroupNode: false});

      if (groupNodes.hasOwnProperty(nodeId)) {
        let payloadData = {
          expandAll: true,
          nodeInfo: nodeInfo
        };
        handleGroupNodeExpand(payloadData);
        setUserPreferences();
      } else if (leafNodes.hasOwnProperty(nodeId)) {
        let payloadData = {
          expandAll: true,
          nodeInfo: nodeInfo
        };
        handleLeafNodeExpansion(payloadData);
        setUserPreferences();
      }
    } else {
      let nodeInfo = {
        nodeId: undefined,
        isGroupNode: false
      };
      setClickedNode(nodeInfo);
    }
  };

  const getNodeObject = (nodeId, edgeObject?) => {
    let nodeInfo = {};
    nodeInfo["nodeId"] = nodeId;
    let parentNode = network.getConnectedNodes(nodeId, "from");
    nodeInfo["parentNode"] = parentNode[0];
    if (edgeObject && Object.keys(edgeObject).length) {
      nodeInfo["predicateIri"] = edgeObject["predicate"];
    } else {
      nodeInfo["predicateIri"] = getEdgePredicate(nodeId, network);
    }

    if (groupNodes.hasOwnProperty(nodeId)) {
      nodeInfo["isGroupNode"] = true;
      nodeInfo["expandId"] = parentNode[0] + "-" + nodeInfo["predicateIri"];
    }
    return nodeInfo;
  };
  const [stabilizeAux, setStabilizeAux] = useState(true);
  useEffect(() => {
    setHasStabilized(true);
  }, [stabilizeAux]);

  const events = {
    select: (event) => {
      //handleSelect(event);
    },
    click: handleClick,

    dragStart: (event) => {

    },
    dragEnd: async (event) => {
      let {nodes} = event;
      if (nodes.length > 0) {
        /*let positions = network.getPositions([nodes[0]])[nodes[0]];
        if (positions && positions.x && positions.y) {

        }*/
      }
    },
    hoverNode: (event) => {
      event.event.target.style.cursor = "pointer";
    },
    blurNode: (event) => {
      event.event.target.style.cursor = "";
    },
    hoverEdge: (event) => {
      event.event.target.style.cursor = "pointer";
    },
    blurEdge: (event) => {
      event.event.target.style.cursor = "";
    },
    doubleClick: (event) => {
      handleDoubleClick(event);
    },
    stabilized: (event) => {
      // NOTE if user doesn't manipulate graph on load, stabilize event
      // fires forever. This avoids reacting to infinite events
      setIsLoading(false);
      if (hasStabilized) return;
      if (network) {
        let positions = network.getPositions();
        // When graph is stabilized, nodePositions no longer empty
        if (positions && Object.keys(positions).length) {
          setStabilizeAux(true);
          if (physicsEnabled) {
            setPhysicsEnabled(false);
            return false;
          }
        }
      }
    },
    oncontext: (event) => {
      let nodeId = network.getNodeAt(event.pointer.DOM);
      if (nodeId) {
        event.event.preventDefault();
        setMenuPosition({x: event.event.offsetX, y: event.event.offsetY});
        const {nodeObject, edgeObject, currentNodeExpandId, parentNodeExpandId} = getExpandedNodeObject(nodeId);
        let nodeInfo = getNodeObject(nodeId, edgeObject);

        const parentDocUri = nodeObject && nodeObject.hasOwnProperty("parentDocUri") && nodeObject["parentDocUri"];
        let parentNodeInfo;
        if (parentDocUri) {
          parentNodeInfo = parentDocUri && entityTypeInstances.nodes.find(node => node.id === parentDocUri);
        }
        if (!parentDocUri && parentNodeExpandId) {
          const {nodeObject} = getExpandedNodeObject(parentNodeExpandId);
          parentNodeInfo = nodeObject;
        }
        nodeInfo["entityName"] = nodeObject && nodeObject["group"] ? nodeObject["group"].split("/").pop() : "";
        nodeInfo["hasRelationships"] = nodeObject && nodeObject["hasRelationships"] ? nodeObject["hasRelationships"] : false;
        nodeInfo["count"] = nodeObject && nodeObject["count"] ? nodeObject["count"] : 1;
        nodeInfo["currentNodeExpandId"] = currentNodeExpandId;
        nodeInfo["parentNodeExpandId"] = parentNodeExpandId;
        nodeInfo["isConcept"] = nodeObject && nodeObject["isConcept"] ? nodeObject["isConcept"] : false;
        nodeInfo["docIRI"] = parentNodeInfo && parentNodeInfo["docIRI"] ? parentNodeInfo["docIRI"] : "";
        setClickedNode(nodeInfo);
      } else {
        let nodeInfo = {
          nodeId: undefined,
          isGroupNode: false
        };
        setClickedNode(nodeInfo);
      }
    },
    dragging: (event) => {
      if (clickedNode && clickedNode["nodeId"]) {
        let nodeInfo = {
          nodeId: undefined,
          isGroupNode: false
        };
        setClickedNode(nodeInfo);
      }
    }
  };

  return (
    <div id="graphVisExplore">
      <div className={styles.graphContainer}>
        <Graph
          graph={graphData}
          options={options}
          events={events}
          getNetwork={initNetworkInstance}
        />
        {contextMenuVisible && menu()}
        <TableViewGroupNodes
          isVisible={openTableViewForGroupNodes}
          toggleTableViewForGroupNodes={toggleTableViewForGroupNodes}
          relatedToData={relatedToData}
        />
      </div>
    </div>
  );
};

export default GraphVisExplore;
