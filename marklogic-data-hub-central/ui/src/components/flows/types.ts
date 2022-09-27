import {Step} from "../../types/run-types";

export enum ReorderFlowOrderDirection {
    LEFT = "left",
    RIGHT = "right"
}

export const StepDefinitionTypeTitles = {
  "INGESTION": "Loading",
  "ingestion": "Loading",
  "MAPPING": "Mapping",
  "mapping": "Mapping",
  "MASTERING": "Mastering",
  "mastering": "Mastering",
  "MATCHING": "Matching",
  "matching": "Matching",
  "MERGING": "Merging",
  "merging": "Merging",
  "CUSTOM": "Custom",
  "custom": "Custom"
};


export type SelectedSteps = Record<string, Step[]>
