import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';
import {action, configureActions} from '@storybook/addon-actions';

import {StoryCardComponent} from '../../../utils';
import {ResizableComponent} from '../resizable.component';
import {ThemeModule} from "../..";

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
      directions: object('directions', ['bottomRight', 'bottomLeft']),
      sizeChange: action('sizeChange:')
    }
  }));
