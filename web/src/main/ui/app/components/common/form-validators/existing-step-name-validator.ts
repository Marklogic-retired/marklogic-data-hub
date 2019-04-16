import {FormControl, ValidatorFn} from "@angular/forms";
import {Flow} from "../../flows-new/models/flow.model";

export class ExistingStepNameValidator {
  static forbiddenName(flow: Flow): ValidatorFn {
    return (control: FormControl): { [key: string]: any } | null => {
      const forbiddenName = flow.steps.find((step => step.name === control.value));
      return forbiddenName ? {'forbiddenName': {value: control.value}} : null;
    }
  }
}
