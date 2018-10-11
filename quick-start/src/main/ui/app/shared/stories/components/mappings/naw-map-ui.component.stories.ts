import {CommonModule} from '@angular/common';
import {storiesOf, moduleMetadata} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {
  object,
  text,
  boolean,
  withKnobs
} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../utils';
import {ThemeModule} from "../../../components";
import {NewMapUiComponent} from "../../../components";

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
      mappings: [
        {
          name: "exists",
          properties: {},
          targetEntityType: "http://example.org/Entity-0.0.1/Entity",
          version: 3
        }
      ],
      create: action('create'),
      cancel: action('cancel'),
    }
  }));
