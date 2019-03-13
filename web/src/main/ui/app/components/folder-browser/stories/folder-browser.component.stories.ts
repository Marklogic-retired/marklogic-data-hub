import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {FolderBrowserUiComponent, ThemeModule} from "../..";

storiesOf('Components|Folder Browser', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        FolderBrowserUiComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Folder Browser Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'500px'" [height]="'250px'">
                <app-folder-browser-ui
                  [startPath]="startPath"
                  [absoluteOnly]="absoluteOnly"
                  [showFiles]="showFiles"
                  [currentPath]="currentPath"
                  [isLoading]="isLoading"
                  [folders]="folders"
                  [files]="files"
                  (inputPathChanged)="inputPathChanged($event)"
                  (entryClicked)="entryClicked($event)"
                  (fileClicked)="fileClicked($event)"
                  (folderChanged)="folderChanged($event)"
                ></app-folder-browser-ui>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      startPath: text('startPath', '/start/path/here'),
      absoluteOnly: boolean('absoluteOnly', true),
      showFiles: boolean('showFiles', true),
      currentPath: text('currentPath', 'current/path'),
      isLoading: boolean('isLoading', false),
      folders: object('folders', [
        {"name": "Folder1"},
        {"name": "Folder2"},
        {"name": "Folder3"},
        {"name": "Folder4"}
      ]),
      files: object('files', [
        {"name": "File 1"},
        {"name": "File 2"}
      ]),
      inputPathChanged: action('inputPathChanged:'),
      entryClicked: action('entryClicked:'),
      fileClicked: action('fileClicked:'),
      folderChanged: action('folderChanged:')
    }
  }));
