import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ConfirmDirective} from './confirm.directive';
import {ConfirmPopoverComponent} from './confirmPopover.component';
import {FocusDirective} from './focus.directive';
import {ConfirmOptions, PopoverConfirmOptions} from './confirmOptions.provider';

@NgModule({
  declarations: [ConfirmDirective, ConfirmPopoverComponent, FocusDirective],
  imports: [CommonModule],
  exports: [ConfirmDirective, FocusDirective],
  entryComponents: [ConfirmPopoverComponent],
  providers: [ConfirmOptions, PopoverConfirmOptions]
})
export class ConfirmModule {}
