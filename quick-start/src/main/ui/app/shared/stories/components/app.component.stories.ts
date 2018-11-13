import {Component} from "@angular/core";
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {object, text, boolean, withKnobs} from '@storybook/addon-knobs';
import {withNotes} from '@storybook/addon-notes';
import {action} from '@storybook/addon-actions';
import {linkTo} from '@storybook/addon-links';
import {Route, RouterModule} from "@angular/router";
import {RouterTestingModule} from "@angular/router/testing";
import {ActivatedRoute, ActivatedRouteStub} from "../utils/router-stubs";
import {centered} from '@storybook/addon-centered/angular';
import {StoryCardComponent} from '../utils/story-card/story-card.component';
import {ThemeModule} from "../../components";
import {AppUiComponent} from "../../components";
import {HeaderComponent} from './../../../header/header.component';
import {HttpModule} from '@angular/http';
import { AuthService } from './../../../auth/auth.service';
import { ProjectService } from './../../../projects';
import { JobListenerService } from './../../../jobs/job-listener.service';
import { EnvironmentService } from './../../../environment';
import { STOMPService } from './../../../stomp';

class MockAuthService { }
class MockProjectService { }
class MockSTOMPService { }
class MockJobListenerService { 
  runningJobCount() {
    return 0;
  }
  totalPercentComplete() {}
}
class MockEnvironmentService { }


@Component({
  template:`
  <div layout-padding layout="column" layout-align="center center">
    <h3>Dummy Page</h3>
  </div>
  `
})
class DummyComponent {}

const routes: Route[] = [
  { path: '', component: DummyComponent },
  { path: 'dashboard', component: DummyComponent },
  { path: 'entities', component: DummyComponent },
  { path: 'mappings', component: DummyComponent },
  { path: 'mappings/map', component: DummyComponent },
  { path: 'flows', component: DummyComponent },
  { path: 'flows/:entityName/:flowName/:flowType', component: DummyComponent },
  { path: 'jobs', component: DummyComponent },
  { path: 'traces', component: DummyComponent },
  { path: 'traces/:id', component: DummyComponent },
  { path: 'browse', component: DummyComponent },
  { path: 'view', component: DummyComponent },
  { path: 'login', component: DummyComponent },
  { path: 'settings', component: DummyComponent },
  { path: '**',    component: DummyComponent }
];

class FakeActivatedRoute extends ActivatedRouteStub {
  firstChild = {
      routeConfig: {
          path: 'dashboard'
      }
  };
  setCurrentPath(path) {
      this.firstChild.routeConfig.path = path;
  }
}
const activatedRouteInstance = new FakeActivatedRoute();
activatedRouteInstance.setCurrentPath('dashboard');


storiesOf('Components|App', module)
    .addDecorator(withKnobs)
    .addDecorator(centered)
    .addDecorator(
        moduleMetadata({
            imports: [
              HttpModule,
              ThemeModule,
              RouterModule,
              RouterTestingModule.withRoutes(routes)
            ],
            schemas: [],
            declarations: [
              AppUiComponent, 
              StoryCardComponent, 
              HeaderComponent, 
              DummyComponent
            ],
            providers: [
              { provide: ActivatedRoute, useValue: activatedRouteInstance},
              { provide: AuthService, useValue: new MockAuthService() },
              { provide: ProjectService, useValue: new MockProjectService() },
              { provide: JobListenerService, useValue: new MockJobListenerService() },
              { provide: EnvironmentService, useValue: new MockEnvironmentService() },
              { provide: STOMPService, useValue: new MockSTOMPService() }
            ]
        })
    )
    .add('App Component', () => ({
        template: `
            <mlui-dhf-theme>
              <mlui-story-card width="'1024px'" [height]="'auto'">
                <app-ui
                  [canShowHeader]="canShowHeader"
                  [headerOffset]="headerOffset"
                ></app-ui>
              </mlui-story-card>
            </mlui-dhf-theme>
        `,
        props: {
          canShowHeader: boolean('canShowHeader', true),
          headerOffset: text('headerOffset', '0px'),
        },
    }));
