import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot} from '@angular/router';
import {AuthService} from './auth.service';
import {EnvironmentService} from '../environment';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private envService: EnvironmentService,
    private router: Router) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Promise<boolean> {
    return new Promise<boolean>(resolve => {
      if (this.authService.isAuthenticated()) {
        this.envService.getEnvironment().subscribe((result: boolean) => {
            resolve(result);
          },
          (err) => {
            resolve(false);
          },
          () => {
            if (state.url !== '/login') {
              this.authService.redirectUrl = state.url;
            }
            resolve(false);
          });
      } else {
        // Store the attempted URL for redirecting
        if (state.url !== '/login') {
          this.authService.redirectUrl = state.url;
        }

        // Navigate to the login page
        this.router.navigate(['login']);
        resolve(false);
      }
    });
  }
}
