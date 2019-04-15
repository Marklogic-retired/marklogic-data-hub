import {Component, EventEmitter, Input, OnInit, Output} from "@angular/core";
import {ProjectService} from "../../../../services/projects";
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
      () => {
        this.checkDefaults();
      });
  }

  /*
    Checking if the options are exist if not then initiate it with default value.
    This is the last barrier for the case if the backend has some options omitted.
   */
  private checkDefaults(): void {
    const {
      inputFilePath,
      inputFileType,
      outputURIReplacement
    } = this.step.fileLocations;

    const {
      collections,
      outputPermissions,
      outputFileType
    } = this.step.options;

    const fileLocations = {
      inputFilePath: inputFilePath || this.projectPath || '.',
      inputFileType: inputFileType || 'json',
      outputURIReplacement: outputURIReplacement || ''
    };

    const options = {
      collections: collections || [`${this.step.name}`],
      outputPermissions: outputPermissions || "rest-reader,read,rest-writer,update",
      outputFileType: outputFileType || 'json'
    };

    this.step.fileLocations = fileLocations;
    this.step.options = options;
  }
}
