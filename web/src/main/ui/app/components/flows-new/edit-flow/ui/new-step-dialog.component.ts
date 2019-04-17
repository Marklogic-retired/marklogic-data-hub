import {Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { ManageFlowsService } from '../../services/manage-flows.service';
import { EditFlowUiComponent } from './edit-flow-ui.component';
import {Flow} from "../../models/flow.model";

export interface DialogData {
  title: string;
  databases: any;
  entities: any;
  step: any;
  flow: Flow;
  projectDirectory: string;
}
@Component({
  selector: 'app-new-step-dialog',
  template: `
  <app-new-step-dialog-ui
    [title]="data.title"
    [databaseObject]="data.databases"
    [entities]="data.entities"
    [collections]="collections"
    [step]="data.step"
    [flow]="data.flow"
    [projectDirectory]="data.projectDirectory"
    (getCollections)="getCollections($event)"
    (cancelClicked)="cancelClicked()"
    (saveClicked)="saveClicked($event)"
  ></app-new-step-dialog-ui>
`
})
export class NewStepDialogComponent implements OnInit {
  collections: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    private manageFlowsService: ManageFlowsService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  ngOnInit() {
    if (this.data.flow.steps.length) {
      this.collections = this.data.flow.steps.map(step => {
        return step.name;
      });
    }
  }
  getCollections(db) {
    this.manageFlowsService.getCollections(db).subscribe( resp => {
      this.collections.push(...resp);
    });
  }
  saveClicked(newStep) {
    this.dialogRef.close(newStep);
  }
  cancelClicked(): void {
    this.dialogRef.close(false);
  }
}
