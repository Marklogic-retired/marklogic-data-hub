import React, {useState, useEffect, useContext} from "react";
import { DetailContext } from "../../store/DetailContext";
import Graph from "react-graph-vis";
import "./Relationships.scss";
import "vis-network/dist/dist/vis-network.min.css"; // required here for node popovers
import { getValByConfig } from "../../util/util";
import _ from "lodash";

type Props = {
    data?: any;
    config?: any 
};

/**
 * Component for showing relationships between records.
 *
 * @component
 * @prop {object} data Data payload.
 * @prop {object} config Relationship configuration object.
 * @example
 * TBD
 */
const Relationships: React.FC<Props> = (props) => {

    const detailContext = useContext(DetailContext);

    const [network, setNetwork] = useState<any>(null);
    const [graph, setGraph] = useState({ nodes: [], edges: [] });
    const [relationshipsStyle, setRelationshipsStyle] = useState({});
    const initNetworkInstance = (networkInstance) => {
        setNetwork(networkInstance);
    };

    useEffect(() => {
        if (network) {
            //network.stabilize();
        }
    }, [network]);

    let options = {
        layout: {
            hierarchical: false
        },
        edges: {
            color: "#5fc9aa"
        },
        nodes: {
            margin: {
                top: 9,
                right: 9,
                bottom: 7,
                left: 8
            },
            font: {
                color: "#333"
            },
            shapeProperties: {
                borderRadius: 4
            }
        },
        physics: {
            enabled: true,
            barnesHut: {
              springLength: 160,
              springConstant: 0.01,
              avoidOverlap: 1
            },
            stabilization: {
              enabled: true,
              iterations: 1,
            }
        },
        interaction: {
            hover: true,
        }
    };
    // Any option overrides from config
    options = Object.assign(options, props?.config?.options);

    const getPopover = (items) => {
        const popover = document.createElement("div");
        popover.className = "popover";
        items.forEach(item => {
            const itemDiv = document.createElement("div");
            const labelSpan = document.createElement("span");
            labelSpan.className = "label";
            const labelContent = document.createTextNode(item.label);
            labelSpan.appendChild(labelContent);
            const valueSpan = document.createElement("span");
            valueSpan.className = "value";
            const valueContent = document.createTextNode(item.value);
            valueSpan.appendChild(valueContent);
            itemDiv.appendChild(labelSpan);
            itemDiv.appendChild(valueSpan);
            popover.appendChild(itemDiv);
        });
        return popover;
    }

    const getRootNode = (data, rootConfig, type) => {
        const rootId = getValByConfig(data, rootConfig.id);
        let rootItems: any = [];
        rootConfig?.popover?.items.forEach(item => {
            const label =  item.label;
            const value =  getValByConfig(data, item, true);
            rootItems.push({label: label, value: value});
        })
        const rootPopover = getPopover(rootItems);
        let rootObj: any;
        if (type === "text") {
            let rootLabel = getValByConfig(data, rootConfig.label, true);
            rootLabel = _.isNil(rootLabel) ? null : (Array.isArray(rootLabel) ? rootLabel[0] : rootLabel);
            rootObj = { id: rootId, label: rootLabel, shape: "box", borderWidth: 0, color: "#D4DEFF", title: rootPopover};
        } else if (type === "image") {
            let rootImgSrc = getValByConfig(data, rootConfig.imgSrc, true);
            rootImgSrc = _.isNil(rootImgSrc) ? null : (Array.isArray(rootImgSrc) ? rootImgSrc[0] : rootImgSrc);
            rootObj = { id: rootId, shape: "image", size: 30, image: rootImgSrc, title: rootPopover};
        }
        return rootObj;
    }

    const getRelationNode = (data, relationsConfig, type) => {
        let relObj: any;
        let relItems: any = [];
        relationsConfig?.popover?.items.forEach(item => {
            const label =  item.label;
            const value =  getValByConfig(data, item, true);
            relItems.push({label: label, value: value});
        })
        if (type === "text") {
            relObj = { 
                id: getValByConfig(data, relationsConfig.id), 
                label: getValByConfig(data, relationsConfig.label, true),
                shape: "box",
                borderWidth: 0, 
                color: "#D4DEFF",
                title: getPopover(relItems) 
            }
        } else if (type === "image") {
            relObj = { 
                id: getValByConfig(data, relationsConfig.id), 
                image: getValByConfig(data, relationsConfig.imgSrc, true),
                shape: "image", 
                size: 30, 
                title: getPopover(relItems) 
            }
        }
        return relObj;
    }

    useEffect(() => {
        const nodeSize = props.config.size ? props.config.size : 30;
        const rootId = getValByConfig(props.data, props.config.root.id);

        // Set up related entities
        let relations = getValByConfig(props.data, props.config.relations);
        relations = _.isNil(relations) ? null : (Array.isArray(relations) ? relations : [relations]);

        // if no relations, minimize container and return
        if (!relations) {
            setRelationshipsStyle({...relationshipsStyle, height: "32px"});
            return;
        }

        // Add root, relation nodes
        const nodes: any = [getRootNode(props.data, props.config.root, props.config.type)];
        relations.forEach(rel => {
            nodes.push(getRelationNode(rel, props.config.relations, props.config.type));
        });

        // Construct edges from root
        const edges: any = [];
        relations.forEach(rel => {
            edges.push({ 
                from: rootId, 
                to: getValByConfig(rel, props.config.relations.id), 
                label: getValByConfig(rel, props.config.relations.predicate)
            });
        });

        setGraph({
            nodes: nodes,
            edges: edges
        });
    }, [detailContext.detail]);

    const events = {
        select: ({ nodes, edges }) => {
            if (nodes && nodes[0]) {
                detailContext.handleGetDetail(nodes[0]);
            }
        },
        hoverNode: (event) => {
            event.event.target.style.cursor = "pointer";
        }
    };

    return (
        <div className="relationships" style={relationshipsStyle}>
            <Graph
                graph={graph}
                options={options}
                events={events}
                getNetwork={initNetworkInstance}
            />
        </div>
    );
};

export default Relationships;
