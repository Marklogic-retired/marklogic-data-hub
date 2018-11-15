import {Component, EventEmitter, Input, Output, Inject, HostListener} from "@angular/core";
import {MdlDialogReference} from '@angular-mdl/core';

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
  @Input() flow: any;

  @Output() flowChanged = new EventEmitter();
  @Output() createClicked = new EventEmitter();
  @Output() cancelClicked = new EventEmitter();

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
}
