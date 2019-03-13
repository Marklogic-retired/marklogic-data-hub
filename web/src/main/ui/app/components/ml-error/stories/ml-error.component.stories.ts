import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {StoryCardComponent} from '../../../utils';
import {MlErrorComponent} from '..';
import {ThemeModule} from "../..";

storiesOf('Components|ML Error', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        MlErrorComponent,
        StoryCardComponent],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('ML-Erorr Component', () => ({
    template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="'500px'" [height]="'300px'">
                    <app-ml-error [error]="error"></app-ml-error>
                </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      error: object('Error Object', {
        formatString: "Error Name",
        stack: "SJS Error Name",
        stacks: [
          {
            "uri": "http://Aasd",
            "line": "asd",
            "column": 10
          }
        ],
        stackFrames: [
          {
            "uri": "http://Aasd",
            "line": "asd",
            "column": 10
          }
        ]
      })
    }
  }));
