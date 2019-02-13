import {CommonModule} from '@angular/common';
import {HttpModule} from '@angular/http';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {number, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {NewFlowUiComponent, SelectListComponent, ThemeModule} from "../..";
import {MdlDialogReference} from '@angular-mdl/core';

class MockMdlDialogReference {
  hide() {
  }
};

storiesOf('Components|New Flow', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule, HttpModule],
      schemas: [],
      declarations: [
        NewFlowUiComponent,
        SelectListComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: [
        {provide: MdlDialogReference, useValue: new MockMdlDialogReference()}
      ]
    })
  )
  .addDecorator(centered)
  .add('New Flow Component', () => ({
    template: `
           <mlui-dhf-theme>
           <mlui-story-card [width]="500" [height]="150">
              <app-new-flow-ui
                [markLogicVersion]="markLogicVersion"
                [flowType]="flowType"
                [scaffoldOptions]="scaffoldOptions"
                [mappingOptions]="mappingOptions"
                [codeFormats]="codeFormats"
                [dataFormats]="dataFormats"
                [startingScaffoldOption]="startingScaffoldOption"
                [startingMappingOption]="startingMappingOption"
                [flow]="flow"
                (flowChanged)="flowChanged($event)"
                (createClicked)="create()"
                (cancelClicked)="cancel()"
              ></app-new-flow-ui>
            </mlui-story-card>
            <dialog-outlet></dialog-outlet>
           </mlui-dhf-theme>`,
    props: {
      markLogicVersion: number('markLogicVersion', 9),
      flowType: text('flowType', 'Input'),
      scaffoldOptions: object('scaffoldOptions', [
        {label: 'Create Structure from Entity Definition', value: true},
        {label: 'Blank Template', value: false}
      ]),
      mappingOptions: object('mappingOptions', [
        {label: 'None', value: null},
        {label: "prodmap", value: "prodmap"}
      ]),
      codeFormats: object('codeFormats', [
        {label: 'Javascript', value: 'JAVASCRIPT'},
        {label: 'XQuery', value: 'XQUERY'}
      ]),
      dataFormats: object('dataFormats', [
        {label: 'JSON', value: 'JSON'},
        {label: 'XML', value: 'XML'}
      ]),
      startingScaffoldOption: object('startingScaffoldOption', {
        label: 'Create Structure from Entity Definition',
        value: true
      }),
      startingMappingOption: object('startingMappingOption', {label: 'None', value: null}),
      flow: object('flow', {
        flowName: <string>null,
        codeFormat: 'JAVASCRIPT',
        dataFormat: 'JSON',
        useEsModel: true,
        mappingName: <string>null
      }),
      flowChanged: action('flowChanged'),
      create: action('createClicked'),
      cancel: action('cancelClicked')
    }
  }));
