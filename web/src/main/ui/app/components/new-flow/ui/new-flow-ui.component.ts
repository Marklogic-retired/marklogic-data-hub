import {Component, EventEmitter, Input, Output, Inject, HostListener} from "@angular/core";
import {MdlDialogReference} from '@angular-mdl/core';
import * as _ from 'lodash';

@Component({
  selector: 'app-new-flow-ui',
  templateUrl: './new-flow-ui.component.html',
  styleUrls: ['./new-flow-ui.component.scss'],
})
export class NewFlowUiComponent {
  @Input() markLogicVersion: number;
  @Input() flowType: string;
  @Input() scaffoldOptions: any;
  @Input() mappingOptions: any;
  @Input() codeFormats: any;
  @Input() dataFormats: any;
  @Input() startingScaffoldOption: any;
  @Input() startingMappingOption: any;
  @Input() entity: any;
  @Input() flow: any;
  @Input() flows: any;

  @Output() flowChanged = new EventEmitter();
  @Output() createClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();

  public isNameValid: boolean = true;
  public errorMsg: string = '';

  constructor(
    public dialog: MdlDialogReference
  ) { }

  @HostListener('keydown.esc')
  public onEsc(): void {
    this.cancel();
  }

  hide() {
    this.dialog.hide();
  }

  create() {
    this.dialog.hide();
    this.createClicked.emit();
  }  

  cancel() {
    this.hide();
    this.cancelClicked.emit();
  }

  updateflow(prop: string, val: any) {
    this.flow[prop] = val;
    this.emitUpdatedFlow();
  }

  emitUpdatedFlow() {
    this.flowChanged.emit(this.flow);
  }

  checkName() {
    let nameValid = true;
    let entityName = this.entity && this.entity.info && this.entity.info.title;
    let flowPrefix = (this.flowType.toUpperCase() === 'INPUT') ? 'an' : 'a';
    _.forEach(this.flows, (f) => {
      nameValid = (this.flow.flowName === f.flowName) ? false: nameValid;
    });
    this.errorMsg = (!nameValid) ? `Flow names must be unique. Entity "${entityName}" already contains ${flowPrefix} ${this.flowType} flow named "${this.flow.flowName}"` : '';
    this.isNameValid = nameValid;
  }  
}
