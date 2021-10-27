import React, {useState, useEffect, useContext, useLayoutEffect} from "react";
import Graph from "react-graph-vis";
import "./graph-vis-explore.scss";
import graphConfig from "../../../config/graph-vis.config";
import {Dropdown, Menu} from "antd";
import * as _ from "lodash";
import entityIcon from "../../../assets/Entity-Services.png";
import {SearchContext} from "../../../util/search-context";

type Props = {
  entityTypeInstances: any;
  splitPaneResized: any;
  setSplitPaneResized: any;
  graphView: any;
};

const GraphVisExplore: React.FC<Props> = (props) => {

  const [physicsEnabled, setPhysicsEnabled] = useState(true);
  const [graphData, setGraphData] = useState({nodes: [], edges: []});
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [clickedNode, setClickedNode] = useState(undefined);
  const [hasStabilized, setHasStabilized] = useState(false);
  const {
    searchOptions,
    setGraphViewOptions
  } = useContext(SearchContext);

  // Get network instance on init
  const [network, setNetwork] = useState<any>(null);
  const initNetworkInstance = (networkInstance) => {
    setNetwork(networkInstance);
  };

  const [networkHeight, setNetworkHeight] = useState(graphConfig.defaultOptions.height);
  const vis = require("vis-network/standalone/umd/vis-network"); //eslint-disable-line @typescript-eslint/no-unused-vars

  const [graphDataLoaded, setGraphDataLoaded] = useState(false);
  // Load coords *once* on init


  useEffect(() => {
    if (props.splitPaneResized) {
      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });
      props.setSplitPaneResized(false);
    }
  }, [props.splitPaneResized]);

  useEffect(() => {
    if (props.entityTypeInstances && network) {
      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });
      setGraphDataLoaded(true);

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

  }, [props.entityTypeInstances]);

  useEffect(() => {
    if (network && props.graphView) {
      setGraphData({
        nodes: getNodes(),
        edges: getEdges()
      });
      const updateGraphSettings = async () => {
        await updateNetworkHeight();
      };

      //Initialize graph zoom scale and view position
      if (network) {
        updateGraphSettings();
      }
    }

  }, [network, props.graphView]);


  const selectedEntityExists = () => {
    return props.entityTypeInstances.some(e => e.entityName === searchOptions.entityInstanceId.split("-")[0]);
  };

  useEffect(() => {
    if (network && searchOptions.entityInstanceId && graphDataLoaded) {
      if (selectedEntityExists()) {
        setPhysicsEnabled(false);
        network.selectNodes([searchOptions.entityInstanceId]);
        network.focus(searchOptions.entityInstanceId);
      } else {
        setGraphViewOptions(undefined);
      }
    }
  }, [network && searchOptions.entityInstanceId && graphDataLoaded]);

  const updateNetworkHeight = async () => {
    let baseHeight = Math.round(window.innerHeight-network.body.container.offsetTop);
    if (window.devicePixelRatio < 2) {
      baseHeight = Math.round(window.innerHeight-(network.body.container.offsetTop * window.devicePixelRatio));
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

  const getNodes = () => {
    let nodes;
    nodes = props.entityTypeInstances && props.entityTypeInstances?.map((e) => {
      let key = e.entityName;
      let entity = graphConfig.sampleMetadata["modeling"]["entities"][key];
      let primaryKeyValue = e.primaryKey?.propertyValue;
      let isUri = e.primaryKey?.propertyPath === "uri";
      let nodeId = isUri ? e.uri : primaryKeyValue;
      let entityInstanceId = key+"-"+nodeId;
      let nodeLabel;
      nodeId.length > 6 ? nodeLabel = nodeId.substring(0, 6) + "..." : nodeLabel = nodeId;

      return {
        id: entityInstanceId,
        shape: "custom",
        title: key,
        //...graphConfig.defaultNodeProps,
        color: entity["color"],
        ctxRenderer: ({ctx, x, y, state: {selected, hover}, style, label}) => {
          const r = style.size;
          const color = style.color;
          const drawNode = () => {
            let scale = graphConfig.sampleMetadata?.modeling?.scale ? graphConfig.sampleMetadata?.modeling?.scale : 0.5;
            if (network) {
              scale = network.getScale();
            }
            let displayLabel = scale > 0.6;
            const radius = displayLabel ? r*1.5 : r;
            const imagePositionY = displayLabel ? y-25: y-15;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, 2*Math.PI);
            ctx.fillStyle = !hover ? color: "#EEEFF1";
            ctx.fill();
            ctx.lineWidth = 0.01;
            if (selected) {
              ctx.strokeStyle = "#5B69AF";
              ctx.lineWidth = 4;
            }
            ctx.stroke();
            if (displayLabel) {
              ctx.font = "14px Helvetica Neue";
              ctx.fillStyle = "Black";
              ctx.textAlign = "center";
              ctx.textBaseline = "middle";
              ctx.fillText(nodeLabel, x, y+10);
            }
            if (scale > 0.3 && scale < 0.6) {
              let img = new Image();   // Create new img element
              img.src = entity["icon"] ? entity["icon"] : entityIcon;
              //Drawing the image on canvas
              ctx.drawImage(img, x-12, imagePositionY, 24, 24);
            } else if (scale > 0.6) {
              let img = new Image();   // Create new img element
              img.src = entity["icon"] ? entity["icon"] : entityIcon;
              //Drawing the image on canvas
              ctx.drawImage(img, x-12, imagePositionY, 24, 24);
              ctx.fillText(nodeLabel, x, y+10);
            }
            let expandable = false; // Use this to display ellipsis, when node has connected relationships
            if (expandable) {
              let ellipsisImg = new Image();
              ellipsisImg.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD8AAABQCAYAAACu/a1QAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAnZJREFUeJzt189LVHEUBfBzv05SIqUIhS1q3apVCGlBpgkJisoM/QdtzHKUxJWbSEGaWgVB0K5FqSC4CCenxjZFGyFqIQW1CaWg0VSIee+dNgU1Pp0fbxHh+Szvvd/D9z7eWzxARERERERERERERERERP4FA4BUx3QjfE4Q6DJYXdFTxCYNadJGhhd6l3cbvd02c4IMJgi0mVlN8Wx+A2zW8/zR69nEym6jqfapZtJuGHEahuqi2cAKgIfVeX+sP5vYsFTHdCN9vDTgWAmH/74nmDOfLcln8bdh/VsXpk/Cx6IZDpabDeCTC2JN1zLdq6HZbVMXDZgFLFZuMIlX2PTPOficqGRxADBYHZ27u+OAj3sVLg4Ax33n3QxrjMUfVYO4X8niAGCGJtRWDTgCXRVe7nfQ2fHOufrC+p3W2SNmaIqSDbA7rHoo506ZWWOUZAO6XEnfeBHV+a2GwpoXy297IOUy2LZcAAgCFzmbQIOLGvI/0/J7lZbfq7T8XrXHlyc2o4bEHNYKa+YF36PmklgPq5shcjbAdUdDOlIEuXT1SeJLYT2ZiX8G8C5KNozzYeXa/bHXwPYHXhYi7UgbIZir7DzyRg6E9QxGGK4A9CrLZg4uGA3rXZ7r2iIwWEnur/QPzquadMMLvcvms4XEYlnHySULgvPJTPzFTjPJdF/GyHaAb8rKBp4HQdA8NJ94v9PM0NO+BwF5ieTH0u8Mn+QMquzMYLYnZ382xzvn6sN+UgrFHNbCXvXdTLZPH3bmF/29dT/2fR3M9pT8JhK0VOvjo4jhwG5zfj7GmsBb7c8mNkrNFhEREREREREREREREREREZFK/QT3i+BFtIzcWAAAAABJRU5ErkJggg==";
              ctx.fillStyle = "black";
              ctx.globalCompositeOperation = "color";
              ctx.drawImage(ellipsisImg, x, y+20, 10, 10);
            }
          };
          ctx.save();
          ctx.restore();
          return {
            drawNode,
            nodeDimensions: {width: 1 * r, height: 1 * r},
          };
        }
      };
    });
    return nodes;
  };

  const getEdges = () => {
    let edges: any = [];
    //handle logic for generating edges here
    return edges;
  };

  const options = {
    ...graphConfig.defaultOptions,
    height: networkHeight,
    layout: {
      //hierarchical: true
      //randomSeed: "0.7696:1625099255200",
    },
    physics: {
      enabled: physicsEnabled,
      barnesHut: {
        springLength: 160,
        springConstant: 1,
        avoidOverlap: 1
      },
      stabilization: {
        enabled: true,
        iterations: 1,
      }
    },
    interaction: {
      navigationButtons: true,
      hover: true,
    },
    manipulation: {
      enabled: false
    },
  };

  const menuClick = async (event) => {
    setContextMenuVisible(false);
    if (event.key === "1") {
      if (network) {
        //add logic for menu selection here
      }
    }
  };

  const menu = () => {
    return (
      <Menu id="contextMenu" onClick={menuClick}>
        { clickedNode &&

        <Menu.Item key="1">
        Dummy option
        </Menu.Item>
        }
      </Menu>
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
    //Zoom logic goes here
  }, 400);

  const events = {
    select: (event) => {
      // console.info("SELECT", event);
    },
    click: (event) => {
      //if click is on an edge
      if (event.edges.length > 0 && event.nodes.length < 1) {
        //let connectedNodes = network.getConnectedNodes(event.edges[0]);
        //Add node click actions here
      }
      if (clickedNode) {
        setClickedNode(undefined);
      }
    },

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
    },
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
          if (physicsEnabled) {
            setPhysicsEnabled(false);
            return false;
          }
        }
        // if (modelingOptions.selectedEntity && selectedEntityExists()) {
        //   try { // Visjs might not have new entity yet, catch error
        //     network.selectNodes([modelingOptions.selectedEntity]);
        //   } catch (err) {
        //     console.error(err);
        //   }
        // }
      }
    },
    oncontext: (event) => {
      let nodeId = network.getNodeAt(event.pointer.DOM);
      if (nodeId) {
        event.event.preventDefault();
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
      //Zoom scale logic goes here
      handleZoom(event, networkScale);
    },
    release: (event) => {
      //Add graph span logic here
    //   if (!props.graphEditMode) {
    //     let targetClassName = event.event.target.className;
    //     let usingNavigationButtons = targetClassName || event.event.deltaX || event.event.deltaY ? true : false;
    //     let usingZoomButtons = targetClassName === "vis-button vis-zoomOut" || targetClassName === "vis-button vis-zoomIn";
    //     if (usingNavigationButtons && !usingZoomButtons) {
    //       updateConfigOnNavigation(event);
    //     }
    //   }
    }
  };

  return (
    <div id="graphVisExplore">
      <Dropdown
        overlay={menu}
        trigger={["contextMenu"]}
        visible={contextMenuVisible}
      >
        <div>
          <Graph
            graph={graphData}
            options={options}
            events={events}
            getNetwork={initNetworkInstance}
          />
        </div>
      </Dropdown>
    </div>
  );
};

export default GraphVisExplore;
