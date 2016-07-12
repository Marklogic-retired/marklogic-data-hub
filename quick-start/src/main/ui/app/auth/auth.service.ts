import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class AuthService {
  _authenticated: boolean;
  authenticated: EventEmitter<any> = new EventEmitter();

  constructor() {}

  isAuthenticated() {
    return this._authenticated;
  }

  setAuthenticated(authed: boolean) {
    console.log('Authed: ' + authed);
    this._authenticated = authed;
    this.authenticated.emit(this._authenticated);
  }
}
