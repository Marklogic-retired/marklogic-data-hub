import {centered} from '@storybook/addon-centered/angular';
import {withKnobs} from '@storybook/addon-knobs';
import {moduleMetadata, storiesOf} from '@storybook/angular';

import {GridManiaModule} from '../index';
import {ThemeModule} from '../..';
import {StoryCardComponent} from '../../../utils';

storiesOf('Components|Grid', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule,
        GridManiaModule
      ],
      declarations: [StoryCardComponent]
    })
  )
  .add('Grid Component', () => ({
    template: `
          <mlui-dhf-theme>
            <mlui-story-card width="500px" height="320px">
              <div gm-grid>
                <div gm-row class="flex-100" style="height:300px;">
                  <div gm-col class="flex-0" style="width:100px; background-color:rgba(244, 167, 66, .5); border-right:2px solid black;">
                    Left Grid
                  </div>
                  <gm-divider></gm-divider>
                  <div gm-col class="flex-100" style="width:100px; background-color:rgba(157, 244, 65, .5)">
                    Right Grid
                  </div>
                </div>
              </div>
            </mlui-story-card>
          </mlui-dhf-theme>
        `,
    props: {},
  }));
