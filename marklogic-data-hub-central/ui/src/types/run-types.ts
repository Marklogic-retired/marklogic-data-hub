export interface Flow {
    name: string,
    steps: Step[],
    description?: string
}

export const InitialFlow: Flow = {
  name: "",
  steps: []
};

export interface Step {
    sourceFormat?: any,
    stepDefinitionType: string,
    stepId: string,
    stepName: string,
    stepNumber: string,
    targetEntityType?: string,
    targetFormat?: string
}