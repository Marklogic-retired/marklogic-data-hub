import {RouterModule} from '@angular/router';
import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {MappingsUiComponent, ThemeModule} from "../..";
import {GridManiaModule} from '../../grid';
import {Entity} from '../../../models';
import {Mapping} from '../mapping.model';

storiesOf('Components|Mappings', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [
        CommonModule,
        ThemeModule,
        GridManiaModule,
        RouterModule.forRoot([], {useHash: true}),
      ],
      schemas: [],
      declarations: [
        MappingsUiComponent,
        StoryCardComponent
      ],
      entryComponents: [],
      providers: []
    })
  )
  .addDecorator(centered)
  .add('Mappings Component', () => ({
    template: `
      <mlui-dhf-theme>
        <mlui-story-card width="1500px" height="1500px">
          <app-mappings-ui
            [entities]="entities"
            [entityMappingsMap]="entityMappingsMap"
            (showNewMapping)="showNewMapping($event)"
            (editMapping)="editMapping($event)"
            (deleteMapping)="deleteMapping($event)"
          ></app-mappings-ui>
        </mlui-story-card>
      </mlui-dhf-theme>
      <dialog-outlet></dialog-outlet>
    `,
    props: {
      entities: object('entities', [entity1, entity2]),
      entityMappingsMap: entityMappingsMap, // Map type, not an available knob
      showNewMapping: action('showNewMapping'),
      editMapping: action('editMapping'),
      deleteMapping: action('deleteMapping'),
    }
  }));

let entity1 = new Entity();
entity1.defaultValues().fromJSON({
  filename: "/Widget.entity.json",
  info: {
    "title": "Widget",
    "version": "0.0.1",
    "baseUri": "http://example.org/",
    "description": null
  },
  definition: {
    "properties": [
      {"name": "entityprop1"},
      {"name": "entityprop2"}
    ]
  }
})
entity1.hasDocs = true;

let entity2 = new Entity();
entity2.defaultValues().fromJSON({
  filename: "/Widget2.entity.json",
  info: {
    "title": "Widget2",
    "version": "0.0.1",
    "baseUri": "http://example.org/",
    "description": null
  },
  definition: {
    "properties": [
      {"name": "entityprop3"},
      {"name": "entityprop4"}
    ]
  }
})

let mapping1 = new Mapping();
mapping1.fromJSON({name: "Widget Mapping"});

let mapping2 = new Mapping();
mapping2.fromJSON({name: "Widget Mapping2",});

let entityMappingsMap = new Map<Entity, Array<Mapping>>();
entityMappingsMap.set(entity1, [mapping1, mapping2]);
entityMappingsMap.set(entity2, []);
