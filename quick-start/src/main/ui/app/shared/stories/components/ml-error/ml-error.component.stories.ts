import {CommonModule} from '@angular/common';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {
  object,
  text,
  boolean,
  withKnobs
} from '@storybook/addon-knobs';
import {StoryCardComponent} from '../../utils/story-card/story-card.component';
import {MlErrorComponent} from '../../../components/ml-error';
import {ThemeModule} from "../../../components/theme/theme.module";

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
