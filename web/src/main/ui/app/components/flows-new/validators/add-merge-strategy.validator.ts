import { FormGroup } from '@angular/forms';
import * as _ from "lodash";

export function AddMergeStrategyValidator(group: FormGroup) {
  let errors = {};
  if (group.value.default === 'false') {
    if (!group.value.name) {
      errors['noName'] = true;
    }
  }
  return _.isEmpty(errors) ? null : errors;
}
