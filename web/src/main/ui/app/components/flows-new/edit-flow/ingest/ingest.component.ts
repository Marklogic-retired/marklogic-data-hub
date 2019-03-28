import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from "@angular/core";
import {Ingestion} from "./model/ingest.model";
import {Step} from "../../models/step.model";
import {IngestUiComponent} from "./ui/ingest-ui.component";

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
  @ViewChild(IngestUiComponent) ingestUi: IngestUiComponent;

  loadedStep: Step;

  ngOnInit(): void {
    this.loadedStep = Ingestion.fromConfig(this.step);
  }

  getStep(flow){
    const uiStep = this.ingestUi.getStep(flow);
    return Ingestion.fromUI(uiStep);
  }
}
