import {CommonModule} from '@angular/common';
import {moduleMetadata, storiesOf} from '@storybook/angular';
import {centered} from '@storybook/addon-centered/angular';
import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';
import {action} from '@storybook/addon-actions';
import {StoryCardComponent} from '../../../utils';
import {HeaderUiComponent, ThemeModule} from '../..';
import {Route, RouterModule} from '@angular/router';
import {Component, Directive, ElementRef, HostListener, NgModule, Renderer2} from '@angular/core';
import {RouterTestingModule} from '@angular/router/testing';
import {MdlButtonComponent, MdlMenuComponent} from '@angular-mdl/core';

// Dummy Component to give router a component to route to
@Component({
  template: ''
})
export class DummyComponent {
}

const routes: Route[] = [
  {path: '', component: DummyComponent},
  {path: 'entities', component: DummyComponent},
  {path: 'flows', component: DummyComponent},
  {path: 'mappings', component: DummyComponent},
  {path: 'browse', component: DummyComponent},
  {path: 'jobs', component: DummyComponent},
  {path: 'traces', component: DummyComponent},
  {path: 'settings', component: DummyComponent},
];

// This adds and removes the active class when a link is clicked
@Directive({
  selector: '[routerLink]'
})
export class RouterLinkStubDirective {
  constructor(
    private rd: Renderer2,
    private element: ElementRef
  ) {
  }

  @HostListener('click') onClick() {
    // Clicked element is <a> tag, the elements variable queries the parent node in order to find <a> tag sibling with active class
    const elements = this.element.nativeElement.parentNode.querySelectorAll('.active');
    // Loop through elements array and remove active class
    elements.forEach(element => {
      this.rd.removeClass(element, 'active');
    });
    // Add active class to clicked element
    this.rd.addClass(this.element.nativeElement, 'active');

  }
}

@NgModule({
  declarations: [DummyComponent, RouterLinkStubDirective]
})
export class DummyComponentModule {
}


storiesOf('Components|Header', module)
  .addDecorator(withKnobs)
  .addDecorator(
    moduleMetadata({
      imports: [
        CommonModule,
        RouterModule,
        ThemeModule,
        RouterTestingModule.withRoutes(routes)
      ],
      schemas: [],
      declarations: [
        HeaderUiComponent,
        StoryCardComponent,
        DummyComponent,
        RouterLinkStubDirective
      ],
      entryComponents: [],
      providers: [MdlButtonComponent, MdlMenuComponent]
    })
  )
  .addDecorator(centered)
  .add('Header Component', () => ({
    template: `
           <mlui-dhf-theme>
             <mlui-story-card [width]="'1300px'">
                <app-header-ui
                  [runningJobs]="runningJobs"
                  [percentageComplete]="percentageComplete"
                  (logout)="logout($event)"
                ></app-header-ui>
             </mlui-story-card>
           </mlui-dhf-theme>`,
    props: {
      runningJobs: number('runningJobs', 0),
      percentageComplete: number('percentageComplete', 0),
      logout: action('logout clicked')
    }
  }));
