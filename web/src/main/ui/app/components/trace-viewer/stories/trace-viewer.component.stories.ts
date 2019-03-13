import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {MlErrorComponent, ThemeModule, TraceViewerUiComponent} from "../../index";
import {CodemirrorComponent} from '../../codemirror';

storiesOf('Components|Trace Viewer', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        TraceViewerUiComponent,
        MlErrorComponent,
        CodemirrorComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Trace Viewer Component', () => ({
    template: `
           <mlui-dhf-theme>
            <mlui-story-card [width]="'700px'" [height]="'675px'">
              <app-trace-viewer-ui
                  [trace]="trace"
                  [currentPluginType]="currentPluginType"
                  [currentPlugin]="currentPlugin"
                  [collapsed]="collapsed"
                  [outputCollapsed]="outputCollapsed"
                  [errorCollapsed]="errorCollapsed"
                  [codeMirrorConfig]="codeMirrorConfig"
                  (setCurrent)="this.setCurrent($event)">
                </app-trace-viewer-ui>
              </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      trace: object('trace', {
        traceId: '6995239382254954168',
        format: 'xml',
        identifier: 'marklogic-data-hub/examples/healthcare/src/main/hub-internal-config/security/roles/hub-admin-role.json-0-4',
        flowType: 'harmonize',
        created: '2018-11-13T15:13:50.29805-08:00',
        steps: [
          {
            label: 'content',
            duration: 0.00091,
            options: {
              object: {
                entry: {
                  value: '2055542352186268321'
                }
              }
            },
            input: {},
            output: '<root><__>{</__></root>',
          },
          {
            label: 'headers',
            duration: 0.00091,
            options: {
              object: {
                entry: {
                  value: '2055542352186268321'
                }
              }
            },
            input: {content: '<root><__>{</__></root>'},
            output: '<root><__>{</__></root>',
          },
          {
            label: 'triples',
            duration: 0.00091,
            options: {
              object: {
                entry: {
                  value: '2055542352186268321'
                }
              }
            },
            input: {headers: '<root><__>{</__></root>'},
            output: '<root><__>{</__></root>',
          },
          {
            label: 'writer',
            duration: 0.00091,
            options: {
              object: {
                entry: {
                  value: '2055542352186268321'
                }
              }
            },
            input: {envelope: '<root><__>{</__></root>'},
            output: '<root><__>{</__></root>',
          }
        ]
      }),
      currentPluginType: text('current plugin type', 'content'),
      currentPlugin: object('plugin', {
        label: 'content',
        duration: 0.00091,
        options: {
          object: {
            entry: {
              value: '2055542352186268321'
            }
          }
        },
        input: {},
        output: '<root><__>{</__></root>',
      }),
      collapsed: object('collapsed', {}),
      outputCollapsed: boolean('output collapsed', false),
      errorCollapsed: boolean('error collapsed', false),
      codeMirrorConfig: object('code mirror config', {
        lineNumbers: true,
        indentWithTabs: true,
        lineWrapping: true,
        readOnly: true,
        cursorBlinkRate: 0
      }),
      setCurrent: action('set current:'),
    }
  }));
