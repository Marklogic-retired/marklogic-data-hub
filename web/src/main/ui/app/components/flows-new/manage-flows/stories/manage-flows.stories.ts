import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {ManageFlowsModule} from "../../manage-flows.module";
import {ThemeModule} from "../../../index";
import {StoryCardComponent} from "../../../../utils";
import {
  MatButtonModule,
  MatChipsModule,
  MatExpansionModule,
  MatFormFieldModule,
  MatIconModule,
  MatInputModule,
  MatPaginatorModule,
  MatRippleModule,
  MatSelectModule,
  MatSnackBarModule,
  MatSortModule,
  MatTableModule,
  MatTabsModule
} from "@angular/material";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {flowsModelArray} from "./manage-flows.data";
import {ActivatedRouteStub} from "../../../../utils/stories/router-stubs";
import {ActivatedRoute, Route, RouterModule} from "@angular/router";
import {RouterTestingModule} from "@angular/router/testing";
import {Component} from "@angular/core";
import {RunFlowDialogComponent} from "../../edit-flow/ui/run-flow-dialog.component";
import {EditFlowModule} from "../..";

@Component({
  template: ''
})
class DummyComponent {
}

const routes: Route[] = [
  {path: '', component: DummyComponent},
  {path: 'flows', component: DummyComponent}
];

storiesOf('Components|Flows', module)
  .addDecorator(withKnobs)
  //.addDecorator(centered)
  .addDecorator(
    moduleMetadata({
      imports: [
        ThemeModule,
        BrowserAnimationsModule,
        MatButtonModule,
        MatChipsModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        MatPaginatorModule,
        MatRippleModule,
        MatSelectModule,
        MatSortModule,
        MatSnackBarModule,
        MatTableModule,
        MatTabsModule,
        ManageFlowsModule,
        RouterModule,
        RouterTestingModule.withRoutes(routes),
        EditFlowModule
      ],
      declarations: [
        StoryCardComponent,
        DummyComponent
      ],
      providers: [
      ]
    })
  ).add('Flows Manage Page', () => ({
  template: `
      <mlui-dhf-theme>
        <flows-page-ui [flows]="flowsModels"></flows-page-ui>
      </mlui-dhf-theme>
    `,
  props: {
    flowsModels: object('Flows Model', flowsModelArray)
  }
}));
