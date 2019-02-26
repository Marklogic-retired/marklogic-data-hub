import {FormControl, ValidationErrors, ValidatorFn, Validators} from "@angular/forms";

export class CustomFieldValidator {
  static number(prms : {min?:number, max?:number} = {}): ValidatorFn {
    return (control: FormControl): { [key: string]: any } => {
      if (Validators.required(control)) {
        return null;
      }
      let val: number = control.value;

      if (isNaN(val) || /\D/.test(val.toString())) {
        return {'number': true};
      } else if (!isNaN(prms.min) && !isNaN(prms.max)) {

        return (val < prms.min || val > prms.max) ? {'number': true} : null;
      } else if (!isNaN(prms.min)) {

        return val < prms.min ? {'number': true} : null;
      } else if (!isNaN(prms.max)) {

        return val > prms.max ? {'number': true} : null;
      } else {
        return null;
      }
    };
  }
}
