import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class AuthService {
  _authenticated: boolean;
  authenticated: EventEmitter<any> = new EventEmitter();

  constructor() {
    this.setAuthenticated(false);
  }

  isAuthenticated() {
    return this._authenticated;
  }

  setAuthenticated(authed: boolean) {
    this._authenticated = authed;
    this.authenticated.emit(this._authenticated);
  }
}
