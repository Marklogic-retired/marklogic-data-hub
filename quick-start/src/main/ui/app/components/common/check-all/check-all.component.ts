import { Component, Input, OnInit } from '@angular/core';
import { NgModel } from '@angular/forms';
import { MatCheckboxChange } from '@angular/material';

@Component({
  selector: 'app-check-all',
  template: `
    <mat-checkbox class="mat-option"
                [disableRipple]="true"
                [indeterminate]="!runAll"
                [checked]="isCheckAll()"
                (change)="toggleSelection($event)">
      {{label}}
    </mat-checkbox>
  `,
  styles: ['']
})
export class CheckAllComponent implements OnInit {
  @Input() selected = [];
  @Input() values = [];
  @Input() label: string;

  constructor() { }

  ngOnInit() {
  }

  isChecked(): boolean {
    return true;
    // return this.model.value && this.values.length
    //   && this.model.value.length === this.values.length;
  }

  isIndeterminate(): boolean {
    return true;
    // return this.model.value && this.values.length && this.model.value.length
    //   && this.model.value.length < this.values.length;
  }

  toggleSelection(change: MatCheckboxChange): void {
    // if (change.checked) {
    //   this.model.update.emit(this.values);
    // } else {
    //   this.model.update.emit([]);
    // }
  }
}
