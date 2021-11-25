const CARD = "Card";
const GRAPH = "Graph";

const FIRST_TIME_VIEW = [
  { database: "final", view: GRAPH, datasource: "entities" },
  { database: "staging", view: GRAPH, datasource: "entities" },
  { database: "staging", view: CARD, datasource: "all-data" },
  { database: "final", view: CARD, datasource: "all-data" },
];

export { CARD, GRAPH, FIRST_TIME_VIEW };
