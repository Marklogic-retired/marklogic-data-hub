import {EventEmitter, Injectable} from '@angular/core';

@Injectable()
export class AuthService {
  authenticated: EventEmitter<any> = new EventEmitter();
  redirectUrl: string;

  constructor() {
  }

  isAuthenticated() {
    return localStorage.getItem('_isAuthenticated_') === 'true';
  }

  setAuthenticated(authed: boolean) {
    localStorage.setItem('_isAuthenticated_', authed.toString());
    this.authenticated.emit(authed);
  }
}
