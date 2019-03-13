import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';
import {action, configureActions} from '@storybook/addon-actions';

import {StoryCardComponent} from '../../../utils';
import {ThemeModule} from "../..";
import {CodemirrorComponent} from '..';

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
                (ngModelChange)="modelChange($event)"
                (saveEvent)="saveEvent($event)"
                (cmChange)="cmChange($event)"></app-codemirror>
            </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      contents: text('contents', `
        /*
        * Create Triples Plugin
        *
        * @param id       - the identifier returned by the collector
        * @param content  - the output of your content plugin
        * @param headers  - the output of your heaaders plugin
        * @param options  - an object containing options. Options are sent from Java
        *
        * @return - an array of triples
        */

        function createTriples(id, content, headers, options) {
          return [];
        }
        
        module.exports = {
          createTriples: createTriples
        };           
      `),
      codemirrorConfig: object('codemirrorConfig', {
        lineNumbers: true,
        indentWithTabs: true,
        lineWrapping: true,
        readOnly: false,
        cursorBlinkRate: 0,
        mode: 'text/javascript'
      }),
      cmChange: action('cmChange:'),
      saveEvent: action('saveEvent:'),
      modelChange: action('modelChange:')
    }
  }));

/*

              [(dirty)]="plugin.$dirty"
              [(history)]="plugin.history"
*/
