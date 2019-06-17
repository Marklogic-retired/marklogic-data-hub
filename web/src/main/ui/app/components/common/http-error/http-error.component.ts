import {Component, Input} from "@angular/core";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'http-error',
  templateUrl: 'http-error.component.html',
  styleUrls: ['./http-error.component.scss']
})

export class HttpErrorComponent {
  @Input() error: any;
  constructor() {}

}
