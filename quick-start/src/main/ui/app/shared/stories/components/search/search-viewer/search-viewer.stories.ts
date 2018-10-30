import 'rxjs/add/observable/of';

import { CommonModule } from '@angular/common';
import { centered } from '@storybook/addon-centered/angular';
import { withKnobs } from '@storybook/addon-knobs';
import { moduleMetadata, storiesOf } from '@storybook/angular';

import { SearchViewerUiComponent } from '../../../../components/search/';
import { ThemeModule } from '../../../../components/theme/';
import { StoryCardComponent } from '../../../utils/story-card/story-card.component';
import { CodemirrorComponent } from './../../../../../codemirror/';

storiesOf('Components|Search', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [CommonModule, ThemeModule],
      schemas: [],
      declarations: [
        CodemirrorComponent,
        SearchViewerUiComponent,
        StoryCardComponent],
      entryComponents: [],
    })
  )
  .addDecorator(centered)
  .add('Search Viewer Component', () => ({
    template: `
            <mlui-dhf-theme width = "1000px">
              <mlui-story-card width="800px" height="800px">
                    <app-search-viewer-ui
                      [uri]="sampleUri"
                      [doc]="sampleDoc"
                    ></app-search-viewer-ui>
              </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      sampleUri: 'doc/sample.json',
      sampleDoc: `
      {
        "envelope": {
          "headers": {},
          "triples": [],
          "instance": {
            "id": "741",
            "customer": "204",
            "order_date": "08/20/2017",
            "ship_date": "08/29/2017",
            "product_id": "1000249",
            "sku": "298337297722",
            "price": "5.0",
            "quantity": "1.0",
            "discounted_price": "5.0",
            "title": "varied slope Extension 1",
            "description": ""
          },
          "attachments": null
        }
      }
    `
    }
  }));
