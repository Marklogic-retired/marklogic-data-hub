import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {object, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {JobExportUiComponent, ThemeModule} from "../../index";
import {MdlDialogService} from '@angular-mdl/core';
import {Component, EventEmitter, Input, NgModule, Output} from '@angular/core';

@Component({
  selector: 'app-job-export-button',
  template: '<button (click)="openModal()">Open Modal</button>'
})
export class JobExportButtonComponent {
  @Input() jobIds: string[];
  @Output() exportClicked = new EventEmitter();

  constructor(
    private dialogService: MdlDialogService
  ) {
  }

  openModal() {
    this.dialogService.showCustomDialog({
      component: JobExportUiComponent,
      providers: [
        {
          provide: 'exportClicked',
          useValue: () => {
            this.exportClicked.emit();
          }
        },
        {
          provide: 'jobIds',
          useValue: this.jobIds
        }
      ],
      isModal: true
    });
  }
}

@NgModule({
  declarations: [JobExportButtonComponent]
})
export class JobExportButtonModule {
}

storiesOf('Components|Jobs', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      declarations: [JobExportUiComponent, StoryCardComponent, JobExportButtonComponent],
      entryComponents: [JobExportUiComponent],
      providers: [MdlDialogService]
    })
  )
  .addDecorator(centered)
  .add('Job Export Component', () => ({
    template: `
           <mlui-dhf-theme>
           <mlui-story-card [width]="500" [height]="150">
              <app-job-export-button
                [jobIds]="jobIds"
                (exportClicked)="exportClicked()"
              ></app-job-export-button>
            </mlui-story-card>
            <dialog-outlet></dialog-outlet>
           </mlui-dhf-theme>`,
    props: {
      jobIds: object('jobIds', ['ccacd1fc-6cf5-4a6f-ad8c-6505cb0be062']),
      exportClicked: action('exportClicked')
    }
  }));
