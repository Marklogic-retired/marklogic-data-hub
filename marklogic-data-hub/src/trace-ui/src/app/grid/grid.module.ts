import { NgModule } from '@angular/core';

import { GridManiaComponent, DividerComponent } from './grid.component';

@NgModule({
  exports: [
    GridManiaComponent,
    DividerComponent
  ],
  declarations: [
    GridManiaComponent,
    DividerComponent
  ]
})
export class GridManiaModule { }
