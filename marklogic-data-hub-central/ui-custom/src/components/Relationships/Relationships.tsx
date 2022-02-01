import React, {useState, useEffect, useContext} from "react";
import { DetailContext } from "../../store/DetailContext";
import Graph from "react-graph-vis";
import styles from "./Relationships.module.scss";

type Props = {
    id: number;
    data?: any;
    config?: any 
};

/**
 * Component for showing relationships between records.
 *
 * @component
 * @prop {object} data - Data payload.
 * @prop {object[]} config  Array of relationship configuration objects.
 * @prop {number} id - ID of root record.
 * @example
 * TBD
 */
const Relationships: React.FC<Props> = (props) => {

    const detailContext = useContext(DetailContext);

    const [network, setNetwork] = useState<any>(null);
    const initNetworkInstance = (networkInstance) => {
        setNetwork(networkInstance);
    };
    useEffect(() => {
        if (network) {
            //network.stabilize();
        }
    }, [network]);

    const options = {
        layout: {
            hierarchical: false
        },
        edges: {
            color: "#000000"
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
        },
    };

    //const currentId = detailContext.detail.result[0].extracted.person["personId"];
    const currentId = props.id;
    const imageArr = [
        "https://cdn1.marklogic.com/wp-content/uploads/2020/04/JamesKenwood-headshot-600x600-1.jpg",
        "https://cdn1.marklogic.com/wp-content/uploads/2021/07/chuck-hollis.jpeg",
        "https://cdn1.marklogic.com/wp-content/uploads/2018/02/trinh-lieu-profile.jpg",
        "https://cdn1.marklogic.com/wp-content/uploads/2021/02/1612313387205.jpeg",
        "https://cdn1.marklogic.com/wp-content/uploads/2020/11/george-bloom-headshot-300x300-1.jpg"
        
    ];

    const graph = {
        nodes: [
          { id: currentId, shape: "image", size: 30, image: imageArr[(currentId)%5] },
          { id: currentId+1, shape: "image", size: 30, image: imageArr[(currentId+1)%5] },
          { id: currentId+2, shape: "image", size: 30, image: imageArr[(currentId+2)%5] },
          { id: currentId+3, shape: "image", size: 30, image: imageArr[(currentId+3)%5] },
          { id: currentId+4, shape: "image", size: 30, image: imageArr[(currentId+4)%5] },
        ],
        edges: [
          { from: currentId+2, to: currentId, label: "relatedTo", font: { align: "top" } },
          { from: currentId, to: currentId+1, label: "relatedTo", font: { align: "top" } },
          { from: currentId+1, to: currentId+2, label: "worksWith", font: { align: "top" } },
          { from: currentId+1, to: currentId+3, label: "livesWith", font: { align: "top" } },
          { from: currentId, to: currentId+4, label: "worksWith", font: { align: "top" } },
        ]
      };

    const events = {
        select: ({ nodes, edges }) => {
            if (nodes && nodes[0]) {
                detailContext.handleDetail(nodes[0]);
            }
        },
        hoverNode: (event) => {
            event.event.target.style.cursor = "pointer";
        }
    };

    return (
        <div className={styles.relationships}>
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
