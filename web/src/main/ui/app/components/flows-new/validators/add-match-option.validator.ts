import { FormGroup } from '@angular/forms';
import * as _ from "lodash";

export function AddMatchOptionValidator(group: FormGroup) {
  let errors = {};
  if (group.value.matchType === 'reduce' && group.controls.propertiesReduce) {
    if (!group.controls.propertiesReduce.value[0].name) {
      errors['noReduceName'] = true;
    }
  } else {
    if (!group.value.propertyName) {
      errors['noPropName'] = true;
    }
  }
  return _.isEmpty(errors) ? null : errors;
}
