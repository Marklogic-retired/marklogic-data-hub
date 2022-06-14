import {Props} from "@components/entities/create-edit-step/create-edit-step";
import {StepType} from "../../../types/curation-types";
import {mergingStep} from "./merging.data";

const newMerging: Props = {
  tabKey: "1",
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  isEditing: false,
  stepType: StepType.Merging,
  editStepArtifactObject: {},
  targetEntityType: mergingStep.entityType,
  canReadWrite: true,
  canReadOnly: true,
  createStepArtifact: jest.fn(),
  updateStepArtifact: jest.fn(),
  currentTab: "1",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  onCancel: jest.fn(),
  preloadTypeahead: "",
};

const editMerging: Props= {
  tabKey: "1",
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  isEditing: true,
  stepType: StepType.Merging,
  editStepArtifactObject: mergingStep.artifacts[0],
  targetEntityType: mergingStep.entityType,
  canReadWrite: true,
  canReadOnly: true,
  createStepArtifact: jest.fn(),
  updateStepArtifact: jest.fn(),
  currentTab: "1",
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
  setPayload: jest.fn(),
  onCancel: jest.fn(),
};

const data = {
  newMerging,
  editMerging
};

export default data;
