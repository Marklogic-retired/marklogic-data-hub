// export default function exposeGraphAPI(GraphComponent) {
//     class ExposeGraphApi extends PureComponent {
//         componentDidMount() {
//             window.GRAPH_VIS_API = {
//                   getGraphNodes: () => {...},
//                   waitUntilGraphSimulationEnd: () => {...},
//                   ....
//             }  
//         }
//         render() {
//             return <GraphComponent {...this.props} ref={(ref) => this.componentRef = ref}/>;
//         }
//     }
// }

const exposeGraphAPI = () => GraphComponent => {
    const ExposeGraphApi = () =>  {
        useEffect(() => {
            window.GRAPH_VIS_API = {
                  getGraphNodes: () => {},
                  waitUntilGraphSimulationEnd: () => {},
            }  
        },[]);
        return (
             <GraphComponent {...this.props} ref={(ref) => this.componentRef = ref}/>
        );
    }
}

export default exposeGraphAPI;

// graph={graph}
//       options={options}
//       events={events}
//       getNetwork={network => {
//         //  if you want access to vis.js network api you can set the state in a parent component using this property
//       }}


