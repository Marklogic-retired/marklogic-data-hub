import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {ThemeModule} from '../..';
import {HarmonizeFlowOptionsUiComponent, SelectKeyValuesComponent} from '../../index';

storiesOf('Components|Harmonize Flow Options', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        HarmonizeFlowOptionsUiComponent,
        SelectKeyValuesComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Harmonize Flow Options Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'500px'" [height]="'auto'">
                <app-harmonize-flow-options-ui
                [flow]="flow"
                [settings]="settings"
                [keyVals]="keyVals"
                [keyValTitle]="keyValTitle"
                [validEntityCheck]="validEntityCheck"
                (keyValuesUpdate)="updateKayVals($event)"
                (saveSetting)="saveSettings()"
                (harmonize)="runHarmonize()"
                ></app-harmonize-flow-options-ui>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    styles: [`
           :host ::ng-deep .story-card {
               overflow: overlay
           }
           :host ::ng-deep app-harmonize-flow-options-ui > .run-options {
            width: 100%;
        }
           `],
    props: {
      flow: object('Flow', {
        entityName: 'Entity Name',
        flowName: 'Flow Name'
      }),
      settings: object('settings', {
        batchSize: 100,
        threadCount: 4,
        options: {}
      }),
      keyVals: object('keyVals', [{
        key: '',
        val: ''
      }]),
      keyValTitle: text('Key Value Title', 'Options'),
      validEntityCheck: boolean('validEntityCheck', true),
      updateKayVals: action('update key values'),
      saveSettings: action('save settings'),
      runHarmonize: action('run harmonize click')
    }
  }));
