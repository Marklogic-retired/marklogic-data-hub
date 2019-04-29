import { FormGroup } from '@angular/forms';
import { StepType } from '../models/step.model';
import * as _ from "lodash";

export function NewStepDialogValidator(group: FormGroup) {
  let stepType: typeof StepType = StepType;
  let errors = {};
  if (group.value.stepDefinitionType === stepType.MAPPING ||
      group.value.stepDefinitionType === stepType.MASTERING) {
    if (!group.value.targetEntity) {
      errors['noTargetEntity'] = true;
    }
    if ( 
          (group.value.selectedSource === 'collection' && !group.value.sourceCollection) ||
          (group.value.selectedSource === 'query' && !group.value.sourceQuery)
        ) {
      errors['noSource'] = true;
    }
  }
  return _.isEmpty(errors) ? null : errors;
}
