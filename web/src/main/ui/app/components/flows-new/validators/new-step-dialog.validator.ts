import { FormGroup } from '@angular/forms';
import * as _ from "lodash";

export function NewStepDialogValidator(group: FormGroup) {
  let errors = {};
  if (group.value.type === 'mapping' ||
      group.value.type === 'mastering') {
    if (!group.value.targetEntity) {
      errors['noTargetEntity'] = true;
    }
    if (!group.value.sourceCollection &&
        !group.value.sourceQuery) {
      errors['noSource'] = true;
    }
  }
  return _.isEmpty(errors) ? null : errors;
}
