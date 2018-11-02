import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {
  text,
  withKnobs
} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../utils';
import {ThemeModule} from "../../../components";
import {JobExportUiComponent} from "../../../components";

storiesOf('Components|Jobs', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, HttpModule],
      schemas: [],
      declarations: [
        JobExportUiComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Job Export Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'350px'" [height]="'150px'">
              <app-job-export-ui      
                [question]="question"
                (exportClicked)="exportClicked()"
                (cancelClicked)="cancelClicked()"
              ></app-job-export-ui>
            </mlui-story-card>
           </mlui-dhf-theme>`,
    props: { 
      question: text('question', 'Export and download 1 job and its traces?'),
      exportClicked: action('exportClicked'),   
      cancelClicked: action('cancelClicked')
    }
  }));
