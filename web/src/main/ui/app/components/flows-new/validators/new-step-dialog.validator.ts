import { FormGroup } from '@angular/forms';
import { StepType } from '../models/step.model';
import * as _ from "lodash";

export function NewStepDialogValidator(group: FormGroup) {
  let errors = {};

  switch (group.value.stepDefinitionType) {
    case StepType.MAPPING:
    case StepType.MASTERING:
      if (!group.value.targetEntity) {
        errors['noTargetEntity'] = true;
      }
      if (
        (group.value.selectedSource === 'collection' && !group.value.sourceCollection) ||
        (group.value.selectedSource === 'query' && !group.value.sourceQuery) ||
        (group.value.selectedSource === '')
      ) {
        errors['noSource'] = true;
      }
      break;
    default:
      break;
  }
  return _.isEmpty(errors) ? null : errors;
}
