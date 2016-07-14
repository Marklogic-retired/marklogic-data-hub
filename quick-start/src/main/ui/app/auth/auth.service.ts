import { Injectable, EventEmitter } from '@angular/core';

@Injectable()
export class AuthService {
  _authenticated: boolean = false;
  authenticated: EventEmitter<any> = new EventEmitter();

  constructor() {}

  isAuthenticated() {
    return this._authenticated;
  }

  setAuthenticated(authed: boolean) {
    this._authenticated = authed;
    this.authenticated.emit(this._authenticated);
  }
}
