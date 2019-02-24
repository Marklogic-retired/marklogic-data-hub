import {NgModule} from '@angular/core';
import {Routes} from '@angular/router';
import {FlowsPageComponent} from "./flows-page.component";
import {MaterialModule} from "../../theme/material.module";
import {FlowsPageUiComponent} from "./ui/flows-page-ui.component";
import {ConfirmationDialogComponent} from "../../common/index";
import {NewFlowDialogComponent} from "./ui/new-flow-dialog.component";

const routes: Routes = [
  /*
  {
    path     : 'flows',
    component: FlowsPageComponent,
    resolve  : {
      data: FlowsPageService
    }
  },
  {
    path     : 'products/:id',
    component: EcommerceProductComponent,
    resolve  : {
      data: EcommerceProductService
    }
  },
  {
    path     : 'products/:id/:handle',
    component: EcommerceProductComponent,
    resolve  : {
      data: EcommerceProductService
    }
  },
  {
    path     : 'orders',
    component: EcommerceOrdersComponent,
    resolve  : {
      data: EcommerceOrdersService
    }
  },
  {
    path     : 'orders/:id',
    component: EcommerceOrderComponent,
    resolve  : {
      data: EcommerceOrderService
    }
  }*/
];

@NgModule({
  declarations: [
    ConfirmationDialogComponent,
    NewFlowDialogComponent,
    FlowsPageUiComponent,
    FlowsPageComponent
  ],
  imports     : [
    MaterialModule
  ],
  providers   : [
  ],
  entryComponents: [
    ConfirmationDialogComponent,
    NewFlowDialogComponent
  ]
})
export class FlowsPageModule {}
