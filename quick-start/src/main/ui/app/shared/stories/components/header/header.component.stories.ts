import {CommonModule} from '@angular/common';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {
  object,
  text,
  boolean,
  withKnobs
} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../utils';
import {ThemeModule} from "../../../components";
import {HeaderUiComponent} from "../../../components/header/header-ui.component";
import { Router } from '@angular/router';

storiesOf('Components|Header', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        HeaderUiComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: [Router]
    })
  )
  .addDecorator(centered)
  .add('Header Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'500px'" [height]="'250px'">
                <app-header-ui
                  [runningJobs]="runningJobs"
                  [percentageComplete]="percentageComplete"
                  [routeToJobs]="routeToJobs"
                  (logout)="logout($event)"
                ></app-header-ui>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      // startPath: text('startPath', '/start/path/here'),
      // absoluteOnly: boolean('absoluteOnly', true),
      // showFiles: boolean('showFiles', true),
      // currentPath: text('currentPath', 'current/path'),
      // isLoading: boolean('isLoading', false),
      // folders: object('folders', [
      //   {"name": "Folder1"},
      //   {"name": "Folder2"},
      //   {"name": "Folder3"},
      //   {"name": "Folder4"}
      // ]),
      // files: object('files', [
      //   {"name": "File 1"},
      //   {"name": "File 2"}
      // ]),
      // inputPathChanged: action('inputPathChanged:'),
      // entryClicked: action('entryClicked:'),
      // fileClicked: action('fileClicked:'),
      // folderChanged: action('folderChanged:')
    }
  }));
