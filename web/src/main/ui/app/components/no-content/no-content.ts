import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';


@Component({
  selector: 'app-no-content',
  template: `
  <div class = "icon"><i class="fa fa-frown-o"></i></div>
  <div class="statusText">404 Page Not Found</div>
  <div class = "goto">
      <p class = "txt">The page you are looking for does not exist.</p>
      Return To: <a routerLink ='/'>Your Dashboard </a>
  </div>`,
  styleUrls: ['no-content.scss']
})
export class NoContentComponent {}
