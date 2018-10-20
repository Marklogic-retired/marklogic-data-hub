import {CommonModule} from '@angular/common';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {
  object,
  text,
  boolean,
  number,
  withKnobs
} from '@storybook/addon-knobs';
import { action, configureActions } from '@storybook/addon-actions';

import {StoryCardComponent} from '../../utils/story-card/story-card.component';
import {ThemeModule} from "../../../components/theme/theme.module";
import {CodemirrorComponent} from '../../../components/codemirror/codemirror.component';

storiesOf('Components|Codemirror', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        CodemirrorComponent,
        StoryCardComponent],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Codemirror Component', () => ({
    template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="'100%'" [height]="'100%'">
                <app-codemirror 
                [ngModel]="contents"
                [config]="codemirrorConfig"
                (ngModelChange)="ngModelChange($event)"
                (saveEvent)="saveEvent($event)"
                (cmChange)="cmChange($event)"></app-codemirror>
            </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      contents: text('contents', 'this is some text rendered in the editor'),
      cmChange: action('cmChange:'),
      saveEvent: action('saveEvent:'),
      ngModelChange: action('ngModelChange:'),
      codemirrorConfig: object('codemirrorConfig', {
        lineNumbers: true,
        indentWithTabs: true,
        lineWrapping: true,
        readOnly: true,
        cursorBlinkRate: 0
      })
    }
  }));

  /*

                [(dirty)]="plugin.$dirty"
                [(history)]="plugin.history"
 */