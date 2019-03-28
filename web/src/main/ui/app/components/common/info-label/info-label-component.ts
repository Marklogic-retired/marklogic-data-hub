import {Component, Input, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'info-label',
  templateUrl: 'info-label.component.html',
  styleUrls: ['info-label.component.scss']
})
export class InfoLabelComponent {
  @Input() labelText: string;
  @Input() tooltipText: string;
  @Input() tooltipPlacement: string;
}
