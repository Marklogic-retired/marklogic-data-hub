import { FormControl } from '@angular/forms';
import * as _ from "lodash";

export function WeightValidator(control: FormControl) {
  let errors = {};
  let regex = /^\d+$/;
  if (isNaN(control.value) || !regex.test(control.value.toString())) {
    errors['invalidWeight'] = true;
  }
  return _.isEmpty(errors) ? null : errors;
}
