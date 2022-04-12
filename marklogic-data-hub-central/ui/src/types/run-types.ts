export interface Flow {
    name: string,
    steps?: Step[],
    description?: string
}

export const InitialFlow: Flow = {
  name: "",
  steps: []
};

export interface Step {
    flowName: string,
    isChecked: boolean,
    sourceFormat: any,
    stepDefinitionType: string,
    stepId: string,
    stepName: string,
    stepNumber: string,
}