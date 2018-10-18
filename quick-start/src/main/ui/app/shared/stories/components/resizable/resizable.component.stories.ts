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
import {ResizableComponent} from '../../../components/resizable/resizable.component';
import {ThemeModule} from "../../../components/theme/theme.module";

storiesOf('Components|Resizable', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        ResizableComponent,
        StoryCardComponent],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Resizable Component', () => ({
    template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="'100%'" [height]="'100%'">
                  <app-resizable
                    [minWidth]="minWidth"
                    [minHeight]="minHeight"
                    [directions]="directions" (sizeChange)="sizeChange($event)">
                      <p>Story content</p>
                  </app-resizable>                    
                </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      minWidth: text('minimum width', 350),
      minHeight: text('minimum height', 75),
      directions: object('directions', ['bottomRight','bottomLeft']),
      sizeChange: action('sizeChange:')
    }
  }));
