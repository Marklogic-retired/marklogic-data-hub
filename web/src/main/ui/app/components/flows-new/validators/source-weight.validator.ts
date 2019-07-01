import { FormGroup } from '@angular/forms';
import * as _ from "lodash";

// TODO validate weights in SourceWeight options
export function SourceWeightValidator(group: FormGroup) {
  let errors = {};
  let regex = /^\d+$/;
  let weight = group.value['weight'];
  if (weight && (isNaN(weight) || !regex.test(weight.toString()))) {
    errors['invalidSourceWeight'] = true;
  }
  // TODO uncomment to enable validation
  // return _.isEmpty(errors) ? null : errors;
  return null;
}
