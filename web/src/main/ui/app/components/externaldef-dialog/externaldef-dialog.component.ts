import {
  Component,
  Inject,
  OnInit,
  HostListener
} from '@angular/core';

import { MdlDialogReference } from '@angular-mdl/core';
import { PropertyType } from '../../models/index';

@Component({
  selector: 'app-external-def-dialog',
  templateUrl: './externaldef-dialog.component.html',
  styleUrls: ['./externaldef-dialog.component.scss']
})
export class ExternalDefDialogComponent implements OnInit {

  newExternalRef: string;
  property: PropertyType;
  actions: any;

  constructor(
    private dialog: MdlDialogReference,
    @Inject('property') property: PropertyType,
    @Inject('actions') actions: any) {
    this.property = property;
    this.actions = actions;
  }

  public ngOnInit() {
  }

  createExternalRef() {
    this.property.setExternalRef(this.newExternalRef);
    if (this.actions.save) {
      this.actions.save(this.newExternalRef);
    }
    this.dialog.hide();
  }

  close() {
    if (this.actions.cancel) {
      this.actions.cancel();
    }
    this.dialog.hide();
  }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.dialog.hide();
  }
}
