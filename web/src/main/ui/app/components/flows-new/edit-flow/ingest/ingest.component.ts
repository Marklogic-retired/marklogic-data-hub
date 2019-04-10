import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ProjectService} from "../../../../services/projects";
import {tap} from "rxjs/operators";
import * as _ from 'lodash';

@Component({
  selector: 'app-ingest',
  template: `
    <app-ingest-ui
      [step]="step"
      [flow]="flow"
      (saveStep)="saveStep.emit($event)"
    >
    </app-ingest-ui>
  `
})
export class IngestComponent implements OnInit {
  @Input() step: any;
  @Input() flow: any;
  @Output() saveStep = new EventEmitter();

  projectPath: string;

  constructor(
    private projects: ProjectService
  ) {
  }

  ngOnInit(): void {
    this.projects.getProjects().subscribe(
      ({projects, lastProject}) => {
        console.log('Projects end point: ', projects, lastProject);
        const project = _.find(projects, pr => pr.id === lastProject);
        if (project) {
          this.projectPath = project.path;
        }
        this.checkDefaults();
      },
      ()=>{
        this.checkDefaults();
      });
  }

  private checkDefaults(): void {
    const targetEntity = this.step.options.targetEntity;
    // if no config or not valid config, initialize with default
    // TODO: better way to house-keep ingest options in the Step schema
    if (!this.step.options || this.step.options.matchOptions) {
      this.step.options = {
        inputFilePath: this.projectPath || '.',
        inputFileType: 'json',
        outputCollections: `${targetEntity || ''}`,
        outputPermissions: 'rest-reader,read,rest-writer,update',
        outputFileType: 'json',
        outputURIReplacement: '',
        targetEntity: targetEntity
      };
    }
  }
}
