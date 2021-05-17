// Maps constraint name to user-friendly facet label.
// Order of object properties determines order in sidebar.
const monitorPropertiesConfig = [
  {
    facetName: "stepDefinitionType",
    displayName: "Step Type",
    tooltip: "",
  },
  {
    facetName: "jobStatus",
    displayName: "Status",
    tooltip: "Status of a step that has run.",
  },
  {
    facetName: "flowName",
    displayName: "Flow",
    tooltip: "A sequence of one or more steps that process the data.",
  },
  {
    facetName: "stepName",
    displayName: "Step",
    tooltip: "Code that processes the data.",
  }
];

export default monitorPropertiesConfig;
