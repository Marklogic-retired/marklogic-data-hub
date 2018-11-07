import {
  Component,
  Inject,
  Input
} from '@angular/core';

import { MdlDialogReference } from '@angular-mdl/core';

@Component({
  selector: 'app-has-bugs-dialog',
  templateUrl: './has-bugs-dialog.component.html',
  styleUrls: ['./has-bugs-dialog.component.scss']
})
export class HasBugsDialogComponent {
  @Input() errors: any;

  constructor(
    public dialog: MdlDialogReference,
    @Inject('errors') errors: any)
  {
      this.errors = errors;
  }
}
