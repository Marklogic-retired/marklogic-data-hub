import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-spinner',
  template: `
  <div class="spinner-container" *ngIf="isLoading">
    <mat-progress-spinner
      diameter="28"
      strokeWidth="3"
      color="primary"
      mode="indeterminate"
    ></mat-progress-spinner>
  </div>
  `,
  styleUrls: ['./spinner.component.scss'],
})
export class SpinnerComponent {
  @Input() isLoading: boolean;

  constructor() {
  }
}
