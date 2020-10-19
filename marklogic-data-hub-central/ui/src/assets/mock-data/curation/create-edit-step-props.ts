import { mergingStep } from './merging';
import { StepType } from '../../../types/curation-types';

const newMerging = {
  isVisible: true,
  isEditing: false,
  stepType: StepType.Merging,
  editStepArtifactObject: {},
  targetEntityType: mergingStep.entityType  ,
  canReadWrite: true,
  canReadOnly: true,
  toggleModal: jest.fn(),
  createStepArtifact: jest.fn()
}

const editMerging = {
  isVisible: true,
  isEditing: true,
  stepType: StepType.Merging,
  editStepArtifactObject: mergingStep.artifacts[0],
  targetEntityType: mergingStep.entityType,
  canReadWrite: true,
  canReadOnly: true,
  toggleModal: jest.fn(),
  createStepArtifact: jest.fn()
}

const data = {
  newMerging,
  editMerging
}

export default data;
