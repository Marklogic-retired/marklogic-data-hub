import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {NewMapUiComponent, ThemeModule} from "../..";

storiesOf('Components|Mappings', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        NewMapUiComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('New Map Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'520px'" [height]="'260px'">
                <app-new-map-ui
                  [mappings]="mappings"
                  (create)="create($event)"
                  (cancel)="cancel()"
                ></app-new-map-ui>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      mappings: object('mappings', [
        {
          name: "exists",
          properties: {},
          targetEntityType: "http://example.org/Entity-0.0.1/Entity",
          version: 3
        }
      ]),
      create: action('create'),
      cancel: action('cancel'),
    }
  }));
