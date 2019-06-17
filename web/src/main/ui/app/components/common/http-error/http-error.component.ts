import {Component, Input} from "@angular/core";

@Component({
  selector: 'http-error',
  templateUrl: 'http-error.component.html',
  styleUrls: ['./http-error.component.scss']
})
export class HttpErrorComponent {
  @Input() message: string;
  constructor() {}

}
