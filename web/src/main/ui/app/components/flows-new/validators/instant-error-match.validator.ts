import { ErrorStateMatcher } from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm } from '@angular/forms';

export class InstantErrorStateMatcher implements ErrorStateMatcher {

  constructor(){

  }
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}
