import { mergingStep } from './merging';
import { StepType } from '../../../types/curation-types';

const newMerging = {
  tabKey: '1',
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  isEditing: false,
  stepType: StepType.Merging,
  stepData: {},
  editStepArtifactObject: {},
  targetEntityType: mergingStep.entityType,
  canReadWrite: true,
  canReadOnly: true,
  toggleModal: jest.fn(),
  createStepArtifact: jest.fn(),
  currentTab: '1',
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
}

const editMerging = {
  tabKey: '1',
  openStepSettings: true,
  setOpenStepSettings: jest.fn(),
  isEditing: true,
  stepType: StepType.Merging,
  stepData: {}, // Empty???
  editStepArtifactObject: mergingStep.artifacts[0],
  targetEntityType: mergingStep.entityType,
  canReadWrite: true,
  canReadOnly: true,
  toggleModal: jest.fn(),
  createStepArtifact: jest.fn(),
  currentTab: '1',
  setIsValid: jest.fn(),
  resetTabs: jest.fn(),
  setHasChanged: jest.fn(),
}

const data = {
  newMerging,
  editMerging
}

export default data;
