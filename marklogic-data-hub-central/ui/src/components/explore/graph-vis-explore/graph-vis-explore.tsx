import React, {useState, useEffect, useContext, useLayoutEffect, createElement} from "react";
import styles from "./graph-vis-explore.module.scss";
import Graph from "react-graph-vis";
import graphConfig from "../../../config/graph-vis.config";
import * as _ from "lodash";
import {SearchContext} from "../../../util/search-context";
import {renderToStaticMarkup} from "react-dom/server";
import * as FontIcon from "react-icons/fa";
import {graphViewConfig} from "../../../config/explore.config";
import tooltipsConfig from "../../../config/explorer-tooltips.config";
import {updateUserPreferences, getUserPreferences} from "../../../services/user-preferences";
import {UserContext} from "../../../util/user-context";
import {expandGroupNode} from "../../../api/queries";


type Props = {
  entityTypeInstances: any;
  graphView: any;
  coords: any[];
  setCoords: (coords: any[]) => void;
  hubCentralConfig: any;
  viewRelationshipLabels: any;
  exportPngButtonClicked: boolean;
  setExportPngButtonClicked: any;
};

const GraphVisExplore: React.FC<Props> = (props) => {
  const [expandedNodeData, setExpandedNodeData] = useState({});
  let graphData = {nodes: [], edges: []};

  const coordinatesExist = () => {
    let coordsExist = !!props.coords;
    return coordsExist;
  };
  const [menuPosition, setMenuPosition] = useState<{ x: number, y: number }>({x: 0, y: 0});
  const [physicsEnabled, setPhysicsEnabled] = useState(!coordinatesExist());
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [clickedNode, setClickedNode] = useState({});
  const [hasStabilized, setHasStabilized] = useState(false);

  const {
    searchOptions,
    setGraphViewOptions,
    setSavedNode,
    entityInstanceId
  } = useContext(SearchContext);
  const {
    user
  } = useContext(UserContext);

  // Get network instance on init
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
  };

  const [networkHeight, setNetworkHeight] = useState(graphConfig.defaultOptions.height);
  const vis = require("vis-network/standalone/umd/vis-network"); //eslint-disable-line @typescript-eslint/no-unused-vars

  const [graphDataLoaded, setGraphDataLoaded] = useState(false);

  const {handleError} = useContext(UserContext);
  const [groupNodes, setGroupNodes] = useState({});

  // Load coords *once* on init

  const updateNodesData = (nodes) => {
    network.body.data.nodes.update(nodes);
  };
  const updateEdgesData = (edges) => {
    network.body.data.edges.update(getEdges());
  };

  const clearGraphData = () => {
    let removedIds = network.body.data.nodes.getIds();
    let removededgeIds = network.body.data.edges.getIds();
    network.body.data.nodes.remove(removedIds);
    network.body.data.edges.remove(removededgeIds);
  };

  const initializeGraphData = () => {
    try {
      clearGraphData();
    } catch (err) {
      console.error("Error clearing the graph data before reset.");
    } finally {
      updateNodesData(getNodes());
      updateEdgesData(getEdges());
      setGraphDataLoaded(true);
    }
  };

  useEffect(() => {
    if (Object.keys(props.entityTypeInstances).length && network) {

      initializeGraphData();

      const updateGraphSettings = async () => {
        await updateNetworkHeight();
      };

      //Initialize graph view position
      if (network) {
        updateGraphSettings();
      }
    }
    return () => {
      setGraphDataLoaded(false);
    };

  }, [props.entityTypeInstances, props.viewRelationshipLabels]);

  useEffect(() => {
    if (network && props.graphView) {
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
    };

  }, [network, props.graphView]);

  useEffect(() => {
    if (props.exportPngButtonClicked)  {
      let canvas = document.getElementsByClassName("vis-network")[0]["canvas"];
      let link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.setAttribute("download", "graph-view-explore");
      document.body.appendChild(link);
      link.click();
      props.setExportPngButtonClicked(false);
    }
  }, [props.exportPngButtonClicked]);

  useLayoutEffect(() => {
    if (network) {
      window.graphVisExploreApi = {
        getNodePositions: (nodeIds?: any) => { return !nodeIds ? network.getPositions() : network.getPositions(nodeIds); },
        canvasToDOM: (xCoordinate, yCoordinate) => { return network.canvasToDOM({x: xCoordinate, y: yCoordinate}); },
        focus: (nodeId: any) => { network.focus(nodeId); },
        stopStabilization: () => { network.stopSimulation(); },
      };
    }
  }, [network, graphData]);

  const iconExistsForEntity = (entityName) => {
    return (!props.hubCentralConfig?.modeling?.entities[entityName]?.icon ? false : true);
  };

  const colorExistsForEntity = (entityName) => {
    return (!props.hubCentralConfig?.modeling?.entities[entityName]?.color ? false : true);
  };

  const setUserPreferences = () => {
    let defaultPreferences = getUserPreferences(user.name);
    if (defaultPreferences !== null) {
      let parsedPreferences = JSON.parse(defaultPreferences);
      let preferencesObject = {
        ...parsedPreferences,
        graphViewOptions: {
          groupNodeId: clickedNode["nodeId"],
          parentIRI: "http://marklogic/dummyIRI",
          predicateFilter: "dummyPredicateFilter"
        }
      };
      updateUserPreferences(user.name, preferencesObject);
    }
  };

  useEffect(() => {
    if (network && entityInstanceId && graphDataLoaded) {
      let parentNode = network.getConnectedNodes(entityInstanceId, "from");
      let selectedEntityExists = false;
      if (parentNode && expandedNodeData[parentNode]) {
        selectedEntityExists = expandedNodeData[parentNode]?.nodes?.some(node => node.id === entityInstanceId);
      } else {
        selectedEntityExists = props.entityTypeInstances?.nodes?.some(node => node.id === entityInstanceId);
      }

      if (selectedEntityExists) {
        setPhysicsEnabled(false);
        network.selectNodes([entityInstanceId]);
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

  const getNodes = (nodesToExpand?: any) => {
    let nodes;
    let nodeObj = groupNodes;
    let entityInstNodes = props.entityTypeInstances?.nodes?.slice();
    entityInstNodes = !nodesToExpand ? entityInstNodes : nodesToExpand;
    nodes = entityInstNodes?.map((e) => {
      let entityType = e.group.split("/").pop();
      let entity = props.hubCentralConfig?.modeling?.entities[entityType];
      let nodeId = e.id;
      if (e.count > 1) {
        if (!Object.keys(nodeObj).includes(nodeId)) {
          nodeObj[nodeId] = e;
        }
      }
      let nodeLabel = e.label.length > 9 ? e.label.substring(0, 6) + "..." : e.label;
      // let positionX = undefined;
      // let positionY = undefined;
      // if (props.coords && props.coords[nodeId] && props.coords[nodeId].x && props.coords[nodeId].y) {
      //   positionX = props.coords[nodeId].x;
      //   positionY = props.coords[nodeId].y;
      // }
      return {
        id: nodeId,
        shape: "custom",
        title: e.count > 1 ? tooltipsConfig.graphVis.groupNode(entityType) : e.label.length > 0 ? tooltipsConfig.graphVis.singleNode(e.label): tooltipsConfig.graphVis.singleNodeNoLabel,
        label: nodeLabel,
        color: colorExistsForEntity(entityType) ? entity["color"] : "#EEEFF1",
        // x: positionX,
        // y: positionY,
        ctxRenderer: ({ctx, x, y, state: {selected, hover}, style, label}) => {
          const r = style.size;
          const color = style.color;
          let iconName = iconExistsForEntity(entityType) ? entity.icon : "FaShapes";
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
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2 * Math.PI);
            ctx.fillStyle = !hover ? color : "#EEEFF1";
            ctx.fill();
            ctx.lineWidth = 0.01;
            if (selected) {
              ctx.strokeStyle = "#5B69AF";
              ctx.lineWidth = 4;
            }
            ctx.stroke();
            if (displayLabel) {
              let customLabel = e.count >= 2 ? entityType : nodeLabel;
              ctx.font = "14px Helvetica Neue";
              ctx.fillStyle = "Black";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(customLabel, x, y + 10);
            }
            if (scale > 0.3 && scale < 0.6) {
              let img = new Image();   // Create new img element
              img.src = FontIcon[iconName] ? `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(FontIcon[iconName])))}` : `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(FontIcon["FaShapes"])))}`;
              //Drawing the image on canvas
              ctx.drawImage(img, x - 12, imagePositionY, 24, 24);
            } else if (scale > 0.6) {
              let img = new Image();   // Create new img element
              img.src = FontIcon[iconName] ? `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(FontIcon[iconName])))}` : `data:image/svg+xml,${encodeURIComponent(renderToStaticMarkup(createElement(FontIcon["FaShapes"])))}`;
              //Drawing the image on canvas
              ctx.drawImage(img, x - 12, imagePositionY, 24, 24);
              let customLabel = e.count >= 2 ? entityType : nodeLabel;
              ctx.fillText(customLabel, x, y + 10);
            }
            if (e.hasRelationships) {
              let ellipsisImg = new Image();
              ellipsisImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABQCAYAAACu/a1QAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAnZJREFUeJzt189LVHEUBfBzv05SIqUIhS1q3apVCGlBpgkJisoM/QdtzHKUxJWbSEGaWgVB0K5FqSC4CCenxjZFGyFqIQW1CaWg0VSIee+dNgU1Pp0fbxHh+Szvvd/D9z7eWzxARERERERERERERERERP4FA4BUx3QjfE4Q6DJYXdFTxCYNadJGhhd6l3cbvd02c4IMJgi0mVlN8Wx+A2zW8/zR69nEym6jqfapZtJuGHEahuqi2cAKgIfVeX+sP5vYsFTHdCN9vDTgWAmH/74nmDOfLcln8bdh/VsXpk/Cx6IZDpabDeCTC2JN1zLdq6HZbVMXDZgFLFZuMIlX2PTPOficqGRxADBYHZ27u+OAj3sVLg4Ax33n3QxrjMUfVYO4X8niAGCGJtRWDTgCXRVe7nfQ2fHOufrC+p3W2SNmaIqSDbA7rHoo506ZWWOUZAO6XEnfeBHV+a2GwpoXy297IOUy2LZcAAgCFzmbQIOLGvI/0/J7lZbfq7T8XrXHlyc2o4bEHNYKa+YF36PmklgPq5shcjbAdUdDOlIEuXT1SeJLYT2ZiX8G8C5KNozzYeXa/bHXwPYHXhYi7UgbIZir7DzyRg6E9QxGGK4A9CrLZg4uGA3rXZ7r2iIwWEnur/QPzquadMMLvcvms4XEYlnHySULgvPJTPzFTjPJdF/GyHaAb8rKBp4HQdA8NJ94v9PM0NO+BwF5ieTH0u8Mn+QMquzMYLYnZ382xzvn6sN+UgrFHNbCXvXdTLZPH3bmF/29dT/2fR3M9pT8JhK0VOvjo4jhwG5zfj7GmsBb7c8mNkrNFhEREREREREREREREREREZFK/QT3i+BFtIzcWAAAAABJRU5ErkJggg==";
              ctx.fillStyle = "#777";
              ctx.drawImage(ellipsisImg, x - 5, y + 20, 10, 10);
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
            nodeDimensions: {width: 1 * r, height: 1 * r},
          };
        }
      };
    });
    setGroupNodes(nodeObj);

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
    let edgesFinal: any = props.entityTypeInstances?.edges?.slice();
    edgesFinal = !edgesToExpand ? edgesFinal : edgesToExpand;
    edges = edgesFinal?.map((edge, i) => {
      return {
        ...edge,
        id: edge.id,
        label: props.viewRelationshipLabels ? edge.label : "",
        arrows: {
          to: {
            enabled: false,
          }
        },
        color: "#666",
        font: {
          align: "top",
        },
        smooth: getSmoothOpts(edge.to, edge.from, edges)
      };
    });
    return edges;
  };

  const options = {
    ...graphConfig.defaultOptions,
    height: networkHeight,
    autoResize: true,
    physics: {
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
      }
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

  const updateGraphDataWith = (nodes, edges) => {
    let graphDataTemp: any = graphData;
    graphDataTemp.nodes = getNodes(nodes);
    graphDataTemp.edges = getEdges(edges);
    network.body.data.nodes.remove(graphDataTemp.nodes);
    network.body.data.nodes.update(graphDataTemp.nodes);
    network.body.data.edges.update(graphDataTemp.edges);
  };

  const handleGroupNodeExpand = async (payloadData) => {
    setContextMenuVisible(false);
    let payload = {
      database: searchOptions.database,
      data: {
        "parentIRI": clickedNode && clickedNode["nodeId"] ? clickedNode["nodeId"] : payloadData.nodeInfo["nodeId"], //"http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/3039-Product",
        "predicateFilter": clickedNode && clickedNode["predicateIRI"] ? clickedNode["predicateIRI"] : payloadData.nodeInfo["predicateIRI"] //"http://marklogic.com/example/BabyRegistry-0.0.1/BabyRegistry/includes"
      }
    };
    try {
      let response: any;
      if (!payloadData.expandAll) {
        response = await expandGroupNode(payload, 3);
      } else {
        response = await expandGroupNode(payload);
      }

      if (response.status === 200) {
        let expandedNodeInfo = expandedNodeData;
        let parentNode = payloadData["nodeInfo"] ? payloadData.nodeInfo["parentNode"] : clickedNode["parentNode"];
        expandedNodeInfo[parentNode] = {
          nodes: response.data.nodes,
          edges: response.data.edges,
          removedNode: payload.data["parentIRI"]
        };
        setExpandedNodeData(expandedNodeInfo);
        network.body.data.nodes.remove(payload.data["parentIRI"]);
        let groupNodeObj = groupNodes;
        response.data.nodes.forEach(e => {
          if (e.count > 1) {
            if (!Object.keys(groupNodeObj).includes(e.id)) {
              groupNodeObj[e.id] = e;
            }
          }
        });
        setGroupNodes(groupNodeObj);
        updateGraphDataWith(response.data.nodes, response.data.edges);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleCollapse = async () => {
    try {
      let expandedGroupNodeObject = expandedNodeData[clickedNode["parentNode"]];
      let graphNodesDataTemp = expandedGroupNodeObject.nodes.map(e => e["id"]);
      let graphEdgesDataTemp = expandedGroupNodeObject.edges.map(e => e["id"]);
      let removedNodeIRI = expandedGroupNodeObject.removedNode;
      network.body.data.nodes.remove(graphNodesDataTemp);
      network.body.data.edges.remove(graphEdgesDataTemp);
      let removedNode = getNodes([groupNodes[removedNodeIRI]]);
      network.body.data.nodes.update(removedNode);
    } catch (error) {
      handleError(error);
    }
  };


  const handleMenuClick = async (event) => {
    setContextMenuVisible(false);
    let id = event.target.id;
    if (id === "viewRecordsInTableView") {
      if (network) {
        setUserPreferences();
      }
    } else if (id === "expand3SampleRecords") {
      if (network) {
        let payloadData = {expandAll: false};
        handleGroupNodeExpand(payloadData);
        setUserPreferences();
      }
    } else if (id === "expandAllRecords") {
      if (network) {
        let payloadData = {expandAll: true};
        handleGroupNodeExpand(payloadData);
        setUserPreferences();
      }
    } else if (id === "collapseRecords") {
      if (network) {
        handleCollapse();
        setUserPreferences();
      }
    }
  };

  const isExpandedChildNode = () => {
    let expandedNodeIds = Object.keys(expandedNodeData);
    if (expandedNodeIds.length === 0) {
      return false;
    } else {
      let parentId = clickedNode["parentNode"];
      let expandedNodeObject = expandedNodeData[parentId];
      if (parentId && expandedNodeObject) {
        let expandedNodeChildren = expandedNodeObject.nodes;
        let nodeId = clickedNode["nodeId"];
        let childIndex = expandedNodeChildren.findIndex(node => node.id === nodeId);
        return expandedNodeIds.includes(parentId) && childIndex !== -1;
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

  const menu = () => {
    let entityType = "";
    if (nodeIdExists()) {
      if (groupNodes && groupNodes[clickedNode["nodeId"]]) {
        entityType = groupNodes[clickedNode["nodeId"]].group.split("/").pop();
      } else {
        entityType = clickedNode && clickedNode["entityName"] ?  clickedNode["entityName"] : "";
      }
    }
    return (
      <div id="contextMenu" className={styles.contextMenu} style={{left: menuPosition.x, top: menuPosition.y}}
        onClick={handleMenuClick}>
        {/* {nodeIdExists() &&
          <div id="viewRecordsInTableView" key="1" className={styles.contextMenuItem} >
            <Link to={
              {
                pathname: "/tiles/explore",
              }
            } target="_blank" className={styles.viewRecordsInTableLink} >
              View all related {entityType} records in a table
            </Link>
          </div>
        } */}
        {nodeIdExists() && isGroupNode() && !isExpandedChildNode() &&
          <div id="expand3SampleRecords" key="2" className={styles.contextMenuItem} onClick={handleMenuClick}>
            Expand 3 {entityType} records from this group
          </div>
        }
        {nodeIdExists() && isGroupNode() &&
          <div id="expandAllRecords" key="3" className={styles.contextMenuItem} onClick={handleMenuClick}>
            Expand all {entityType} records in this group
          </div>
        }
        {nodeIdExists() && isExpandedChildNode() &&
          <div id="collapseRecords" key="4" className={styles.contextMenuItem} onClick={handleMenuClick}>
            Collapse all {entityType} records into a group
          </div>
        }
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

  const handleSelect = _.debounce((event) => {
    const {nodes} = event;
    if (nodes.length > 0) {
      const [node] = nodes;
      const nodeId = node;

      let nodeObject = {};
      let parentNode = network.getConnectedNodes(nodeId, "from");
      if (parentNode && expandedNodeData[parentNode]) {
        nodeObject = expandedNodeData[parentNode].nodes.find(node => node.id === nodeId);
      } else {
        nodeObject = props.entityTypeInstances.nodes.find(node => node.id === nodeId);
      }

      if (Object.keys(groupNodes).includes(nodeId)) {
        let nodeInfo = getNodeObject(nodeId);
        let payloadData = {
          expandAll: false,
          nodeInfo: nodeInfo
        };
        handleGroupNodeExpand(payloadData);
      } else {
        setSavedNode(nodeObject);
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
      if (Object.keys(groupNodes).includes(nodeId)) {
        let nodeInfo = getNodeObject(nodeId);
        let payloadData = {
          expandAll: true,
          nodeInfo: nodeInfo
        };
        handleGroupNodeExpand(payloadData);
      }
    }
  };

  const getNodeObject = (nodeId) => {
    let nodeInfo = {};
    nodeInfo["nodeId"] = nodeId;
    nodeInfo["nodeObject"] = nodeId;
    let parentNode = network.getConnectedNodes(nodeId, "from");
    nodeInfo["parentNode"] = parentNode[0];

    if (Object.keys(groupNodes).includes(nodeId)) {
      let edges = network.getConnectedEdges(nodeId);
      let predicateIRI = edges[0].split("-").slice(3, -1).join("-");
      nodeInfo["isGroupNode"] = true;
      nodeInfo["predicateIRI"] = predicateIRI;
    }

    return nodeInfo;
  };

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
    doubleClick: handleDoubleClick,
    stabilized: (event) => {
      // NOTE if user doesn't manipulate graph on load, stabilize event
      // fires forever. This avoids reacting to infinite events
      if (hasStabilized) return;
      if (network) {
        let positions = network.getPositions();
        // When graph is stabilized, nodePositions no longer empty
        if (positions && Object.keys(positions).length) {
          //   saveUnsavedCoords();
          setHasStabilized(true);
          //props.setCoords(positions);
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
        let nodeObject:any = {};
        let parentNode = network.getConnectedNodes(nodeId, "from");
        if (parentNode && expandedNodeData[parentNode]) {
          nodeObject = expandedNodeData[parentNode].nodes.find(node => node.id === nodeId);
        } else {
          nodeObject = props.entityTypeInstances.nodes.find(node => node.id === nodeId);
        }
        let nodeInfo = getNodeObject(nodeId);
        nodeInfo["entityName"] = nodeObject && nodeObject["group"] ? nodeObject.group.split("/").pop() : "";
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
      </div>
    </div>
  );
};

export default GraphVisExplore;
