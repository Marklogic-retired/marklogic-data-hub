import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {Ingestion} from "./model/ingest.model";
import {Step} from "../../models/step.model";

@Component({
  selector: 'app-ingest',
  template: `
    <app-ingest-ui
      [step]="loadedStep"
      (saveStep)="updateStep.emit($event)"
    >
    </app-ingest-ui>
  `
})
export class IngestComponent implements OnInit{
  @Input() step: any;
  @Output() updateStep = new EventEmitter();

  loadedStep: Step;

  ngOnInit(): void {
    this.loadedStep = Ingestion.fromConfig(this.step);
  }
}
