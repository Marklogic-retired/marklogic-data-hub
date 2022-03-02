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
    options = Object.assign(options, props.config.options);

    const getPopover = (title, city, state) => {
        const popover = document.createElement("div");
        popover.className = "popover";
        const titleDiv = document.createElement("div");
        titleDiv.className = "title";
        const nameContent = document.createTextNode(title);
        titleDiv.appendChild(nameContent);
        const placeDiv = document.createElement("div");
        const placeContent = document.createTextNode(city + ", " + state);
        placeDiv.appendChild(placeContent);
        popover.appendChild(titleDiv);
        popover.appendChild(placeDiv);
        return popover;
    }

    useEffect(() => {
        const nodeSize = props.config.size ? props.config.size : 30;

        // Set up root entity
        const rootId = getValByConfig(props.data, props.config.root.id);
        let rootImgSrc = getValByConfig(props.data, props.config.root.imgSrc);
        rootImgSrc = _.isNil(rootImgSrc) ? null : (Array.isArray(rootImgSrc) ? rootImgSrc[0] : rootImgSrc);
        const rootTitle = getValByConfig(props.data, props.config.root.title);
        const rootCity = getValByConfig(props.data, props.config.root.city);
        const rootState = getValByConfig(props.data, props.config.root.state);
        const rootPopover = getPopover(
            Array.isArray(rootTitle) ? rootTitle[0] : rootTitle, 
            Array.isArray(rootCity) ? rootCity[0] : rootCity,
            Array.isArray(rootState) ? rootState[0] : rootState
        );

        // Set up related entities
        let relations = getValByConfig(props.data, props.config.relations);
        relations = _.isNil(relations) ? null : (Array.isArray(relations) ? relations : [relations]);

        // Add root, related to nodes
        const nodes: any = [{ id: rootId, shape: "image", size: nodeSize, image: rootImgSrc, title: rootPopover}];
        relations.forEach(rel => {
            nodes.push({ 
                id: rel[props.config.relations.id], 
                image: rel[props.config.relations.imgSrc],
                shape: "image", 
                size: nodeSize, 
                title: getPopover(
                    rel[props.config.relations.title], 
                    rel[props.config.relations.city], 
                    rel[props.config.relations.state]
                ) 
            });
        });

        // Construct edges from root
        const edges: any = [];
        relations.forEach(rel => {
            edges.push({ 
                from: rootId, 
                to: rel[props.config.relations.id], 
                label: rel[props.config.relations.predicate]
            });
        });

        setGraph({
            nodes: nodes,
            edges: edges
        });
    }, [detailContext.detail]);

    const events = {
        select: ({ nodes, edges }) => {
            console.log("select", nodes);
            if (nodes && nodes[0]) {
                detailContext.handleDetail(nodes[0]);
            }
        },
        hoverNode: (event) => {
            event.event.target.style.cursor = "pointer";
        }
    };

    return (
        <div className="relationships">
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
