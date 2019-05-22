import {ManageFlowsUiComponent} from "../ui/manage-flows-ui.component";
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
import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {RouterTestingModule} from "@angular/router/testing";
import {EditFlowModule} from "../../index";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {ThemeModule} from "../../../index";
import {ManageFlowsModule} from "../../manage-flows.module";
import {Route, RouterModule} from "@angular/router";
import {Component, DebugElement} from "@angular/core";
import {flowsModelArray} from "../stories/manage-flows.data";
import {Flow} from "../../models/flow.model";
import {By} from "@angular/platform-browser";
import * as Selectors from "./manage-flows.selectors";


@Component({
  template: ''
})
class DummyComponent {
}

const routes: Route[] = [
  {path: '', component: DummyComponent},
  {path: 'flows', component: DummyComponent}
];

describe('Component: ManageFlowsUI', () => {

  let component: ManageFlowsUiComponent;
  let fixture: ComponentFixture<ManageFlowsUiComponent>;

  beforeEach(async(() => {
    return TestBed.configureTestingModule({
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
        DummyComponent
      ]
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(ManageFlowsUiComponent);
      component = fixture.componentInstance;
    });
  }));

  it('should create an instance of the component', () => {
    expect(component).toBeTruthy();
  });

  it('should reflect the number of provided flows in the table', () => {
    expect(component).toBeTruthy();
    component.flows = [Flow.fromJSON(flowsModelArray[0]), Flow.fromJSON(flowsModelArray[1])];
    fixture.detectChanges();
    const labelDE: DebugElement = fixture.debugElement.query(By.css(Selectors.PAGINATOR_RANGE_LABEL));
    expect(labelDE).toBeTruthy();
    expect(labelDE.nativeElement).toBeTruthy();
    const label: HTMLElement = labelDE.nativeElement;
    expect(label.innerText).toBeTruthy();
    expect(parseInt(label.innerText.split(' of ')[1])).toEqual(2);
  });
});
