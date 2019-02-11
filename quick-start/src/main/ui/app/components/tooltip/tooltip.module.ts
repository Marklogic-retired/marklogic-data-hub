import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { NgTranscludeDirective } from './common';
import { TooltipContainerUiComponent } from '../index';
import { TooltipContainerComponent } from './tooltip-container.component';
import { TooltipDirective } from './tooltip.directive';
import { ComponentsHelper } from './components-helper.service';

@NgModule({
  imports: [CommonModule],
  declarations: [NgTranscludeDirective, TooltipDirective, TooltipContainerComponent, TooltipContainerUiComponent],
  exports: [TooltipDirective, TooltipContainerComponent],
  providers: [ComponentsHelper],
  entryComponents: [TooltipContainerComponent]
})
export class AppTooltipModule {}
