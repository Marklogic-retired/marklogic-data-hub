import {Component, EventEmitter, Input, Output} from '@angular/core';
import {Step} from '../../../models/step.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-custom-ui',
  templateUrl: './custom-ui.component.html',
  styleUrls: ['./custom-ui.component.scss'],
})
export class CustomUiComponent {
  @Input() step: Step;
  @Input() module: string;
  @Output() updateCustom = new EventEmitter();

  constructor(private snackBar: MatSnackBar) {
  }

  onChange() {
    this.updateCustom.emit(this.step);
    this.snackBar.open("Change Saved.", "", {panelClass: ['snackbar'], duration: 1500});  }
}
