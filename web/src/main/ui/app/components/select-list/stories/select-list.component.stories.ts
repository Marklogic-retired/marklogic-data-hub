import {moduleMetadata, storiesOf} from '@storybook/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../../../utils';
import {SelectListComponent} from '../select-list.component';
import {ThemeModule} from '../..';
import {MdlDialogService} from "@angular-mdl/core";

storiesOf('Components|Select List', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule
      ],
      providers: [MdlDialogService],
      declarations: [SelectListComponent, StoryCardComponent]
    })
  )
  .add('Search Component', () => ({
    template: `
            <mlui-dhf-theme>
                <mlui-story-card [width]="200" [height]="150">
                        <app-select-list
                          [label]="label"
                          [readOnly]="readOnly"
                          [allowRemove]="allowRemove"
                          [items]="items"
                          [initialSelectedItem]="initialSelectedItem"
                          (selectedItem)="selectedItem($event)"
                          (removedItem)="removedItem($event)"
                        >
                        </app-select-list>
                </mlui-story-card>
                <dialog-outlet></dialog-outlet>
            </mlui-dhf-theme>
        `,
    props: {
      label: text('Label', 'label'),
      readOnly: boolean('readOnly', false),
      allowRemove: boolean('allowRemove', false),
      items: object(
        'Items',
        [
          {"label": 'Item N1'},
          {"label": 'Item N2'},
          {"label": 'Item N3'},
          {"label": 'Item N4'},
          {"label": 'Item N5'}
        ]
      ),
      initialSelectedItem: text('initialSelectedItem', 'Item N2'),
      selectedItem: action('Item Selected:'),
      removedItem: action('Item Removed')
    },
  }));
