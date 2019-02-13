import {Component, Input} from "@angular/core";

@Component({
  selector: 'app-tooltip-container-ui',
  templateUrl: './tooltip-container-ui.component.html'
})
export class TooltipContainerUiComponent {
  @Input() isTemplate: boolean;
  @Input() classMap: any;
  @Input() context: any;
  @Input() content: string;
  @Input() top: string;
  @Input() left: string;
  @Input() display: string;
  @Input() htmlContent: string;
}
