import {Component, EventEmitter, Input, Output} from "@angular/core";

@Component({
  selector: 'app-ui',
  templateUrl: './app-ui.component.html',
  styleUrls: ['./app-ui.component.scss'],
})
export class AppUiComponent {
  @Input() canShowHeader: boolean;
  @Input() headerOffset: string;
}
