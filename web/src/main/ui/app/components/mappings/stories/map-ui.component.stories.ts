import {CommonModule} from '@angular/common';
import {RouterModule} from '@angular/router';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {TooltipModule} from 'ngx-bootstrap';
import {StoryCardComponent} from '../../../utils';
import {MapUiComponent, ThemeModule} from "../..";
import {FocusElementDirective} from '../../../directives/focus-element/focus-element.directive';
import {ListFilterPipe} from '../ui/listfilter.pipe';

storiesOf('Components|Mappings', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [
        CommonModule,
        ThemeModule,
        RouterModule.forRoot([], { useHash: true }),
        TooltipModule.forRoot()
      ],
      schemas: [],
      declarations: [
        MapUiComponent,
        FocusElementDirective,
        ListFilterPipe,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Map Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'1050px'" [height]="'400px'">
                <app-map-ui
                  [mapping]="mapping"
                  [chosenEntity]="chosenEntity"
                  [conns]="conns"
                  [sampleDocSrcProps]="sampleDocSrcProps"
                  [editURIVal]="editURIVal"
                  (updateDesc)="updateDesc($event)"
                  (updateURI)="updateURI($event)"
                  (updateMap)="updateMap($event)"
                  (resetMap)="resetMap()"
                ></app-map-ui>
             </mlui-story-card>
           </mlui-dhf-theme>
           <dialog-outlet></dialog-outlet>`,
    props: {
      mapping: object('mapping', {
        description: "A mapping description.",
        language: "zxx",
        name: "Widget Mapping",
        properties: {
          srcprop1: {sourcedFrom: "entityprop1"},
          srcprop2: {sourcedFrom: "entityprop2"}
        },
        sourceContext: "//",
        sourceURI: "/example.csv",
        targetEntityType: "http://example.org/Widget-0.0.1/Widget",
        version: 1
      }),
      chosenEntity: object('chosenEntity', {
        "_scale": 1,
        "editDescription": false,
        "editBaseUri": false,
        "editing": false,
        "hasDocs": true,
        "dragging": false,
        "transform": "translate(287, 277) scale(1)",
        "filename": "/Users/mwooldri/projects/marklogic-data-hub/examples/online-store/plugins/entities/Product/Product.entity.json",
        "hubUi": {
          "vertices": {},
          "x": 100,
          "y": 100,
          "width": 350,
          "height": 100
        },
        "info": {
          "title": "Product",
          "version": "0.0.1",
          "baseUri": "http://example.org/",
          "description": null
        },
        "definition": {
          "description": null,
          "primaryKey": null,
          "required": [],
          "elementRangeIndex": [],
          "rangeIndex": [],
          "wordLexicon": [],
          "pii": [],
          "properties": [
            {
              "showCollation": false,
              "isPrimaryKey": false,
              "hasElementRangeIndex": false,
              "hasRangeIndex": false,
              "hasWordLexicon": false,
              "required": false,
              "pii": false,
              "UNICODE_COLLATION": "http://marklogic.com/collation/codepoint",
              "selected": false,
              "connected": false,
              "hovering": false,
              "name": "entityprop1",
              "datatype": "string",
              "description": null,
              "$ref": null,
              "collation": "http://marklogic.com/collation/codepoint",
              "items": {}
            },
            {
              "showCollation": false,
              "isPrimaryKey": false,
              "hasElementRangeIndex": false,
              "hasRangeIndex": false,
              "hasWordLexicon": false,
              "required": false,
              "pii": false,
              "UNICODE_COLLATION": "http://marklogic.com/collation/codepoint",
              "selected": false,
              "connected": false,
              "hovering": false,
              "name": "entityprop2",
              "datatype": "string",
              "description": null,
              "$ref": null,
              "collation": "http://marklogic.com/collation/codepoint",
              "items": {}
            }
          ]
        },
        "inputFlows": [],
        "harmonizeFlows": []
      }),
      conns: object('conns', {"entityprop1": "srcprop1"}),
      sampleDocSrcProps: object('sampleDocSrcProps', [
        {
          "key": "srcprop1",
          "val": "string1",
          "type": "string"
        },
        {
          "key": "srcprop2",
          "val": "string2",
          "type": "string"
        },
        {
          "key": "srcprop3",
          "val": "string3",
          "type": "string"
        }
      ]),
      editURIVal: text('editURIVal', '/example.csv'),
      updateDesc: action('updateDesc'),
      updateURI: action('updateURI'),
      updateMap: action('updateMap'),
      resetMap: action('resetMap')
    }
  }));
