import {action} from '@storybook/addon-actions';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {ManageFlowsModule} from "../../manage-flows.module";
import {ThemeModule} from "../../../index";
import {StoryCardComponent} from "../../../../utils/index";
import {FlowsPageUiComponent} from "../ui/flows-page-ui.component";
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
import {RouterModule, Routes} from "@angular/router";
import {FlowsPageService} from "../../services/flow-page.service";
import {FlowsPageComponent} from "../flows-page.component";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {flowsModelArray} from "./flows-page.data";

const routes: Routes = [
  {
    path: 'flows',
    component: FlowsPageComponent,
    resolve: {
      data: FlowsPageService
    }
  }
];

storiesOf('Components|Flows', module)
  .addDecorator(withKnobs)
  .addDecorator(centered)
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
        ManageFlowsModule
      ],
      declarations: [
        FlowsPageUiComponent,
        StoryCardComponent
      ]
    })
  ).add('Flows Manage Page', () => ({
  template: `
      <mlui-dhf-theme>
          <mlui-story-card [width]="'1000px'" [height]="'1500px'">
            <flows-page-ui [flows]="flowsModels"></flows-page-ui>
          </mlui-story-card>
      </mlui-dhf-theme>
    `,
  props: {
    flowsModels: object('Flows Model', flowsModelArray)
  }
}));
