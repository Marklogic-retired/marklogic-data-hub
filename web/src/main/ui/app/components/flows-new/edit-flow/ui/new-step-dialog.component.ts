import {Component, Inject } from '@angular/core';
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
  isUpdate: boolean;
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
    [isUpdate]="data.isUpdate"
    (getCollections)="getCollections($event)"
    (cancelClicked)="cancelClicked()"
    (saveClicked)="saveClicked($event)"
  ></app-new-step-dialog-ui>
`
})
export class NewStepDialogComponent {
  collections: string[] = [];
  constructor(
    public dialogRef: MatDialogRef<EditFlowUiComponent>,
    private manageFlowsService: ManageFlowsService,
    @Inject(MAT_DIALOG_DATA) public data: DialogData) {}

  addStepsToCollections() {
    let result;
    if (this.data.flow.steps.length) {
      result = this.data.flow.steps.map(step => {
        return step.name;
      });
    }
    return (result) ? result : [];
  }
  getCollections(db) {
    this.manageFlowsService.getCollections(db).subscribe( resp => {
      this.collections = this.addStepsToCollections();
      resp.map( collection => {
        if ( !this.collections.find(item => item === collection)) {
          this.collections.push(collection);
        }
      });
    });
  }
  saveClicked(newStep) {
    this.dialogRef.close(newStep);
  }
  cancelClicked(): void {
    this.dialogRef.close(false);
  }
}
