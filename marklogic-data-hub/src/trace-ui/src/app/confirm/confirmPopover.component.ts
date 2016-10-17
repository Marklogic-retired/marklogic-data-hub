import {
  Component,
  AfterViewInit,
} from '@angular/core';
import {PopoverConfirmOptions} from './confirmOptions.provider';

/**
 * @private
 */
@Component({
  styleUrls: ['./confirm.style.scss'],
  templateUrl: './confirm.tpl.html'
})
export class ConfirmPopoverComponent implements AfterViewInit {

  constructor(private options: PopoverConfirmOptions) {}

  ngAfterViewInit(): void {
    this.options.onAfterViewInit();
  }

}
