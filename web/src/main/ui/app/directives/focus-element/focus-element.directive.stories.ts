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

import {StoryCardComponent} from '../../utils/stories/story-card.component';
import {FocusElementDirective} from './focus-element.directive';
import {ThemeModule} from "../../components/theme/theme.module";

storiesOf('Directives|Focus Element', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        FocusElementDirective,
        StoryCardComponent],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Focus Element Directive', () => ({
    template: `
            <mlui-dhf-theme>
              <mlui-story-card [width]="'500px;'" [height]="'200px;'">
                <input type="text" [focusElement]="isFocused" />             
              </mlui-story-card>
            </mlui-dhf-theme>`,
    props: {
      isFocused: boolean('is focused', true),
    }
  }));
