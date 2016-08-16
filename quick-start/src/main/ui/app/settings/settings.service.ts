import { Injectable, EventEmitter } from '@angular/core';
import { Http, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class SettingsService {

  traceEnabled: boolean = false;
  debugEnabled: boolean = false;

  constructor(private http: Http) {
    this.isTracingEnabled();
    this.isDebuggingEnabled();
  }

  toggleTracing() {
    if (this.traceEnabled) {
      this.disableTracing();
    } else {
      this.enableTracing();
    }
  }

  enableTracing() {
    return this.http.post('/settings/trace/enable', '').subscribe(() => {
      this.traceEnabled = true;
    });
  }

  disableTracing() {
    return this.http.post('/settings/trace/disable', '').subscribe(() => {
      this.traceEnabled = false;
    });
  }

  toggleDebugging() {
    if (this.debugEnabled) {
      this.disableDebugging();
    } else {
      this.enableDebugging();
    }
  }

  enableDebugging() {
    return this.http.post('/settings/debug/enable', '').subscribe(() => {
      this.debugEnabled = true;
    });
  }

  disableDebugging() {
    return this.http.post('/settings/debug/disable', '').subscribe(() => {
      this.debugEnabled = false;
    });
  }

  private isTracingEnabled() {
    return this.get('/settings/trace/is-enabled').subscribe(resp => {
      this.traceEnabled = resp.enabled;
    });
  }

  private isDebuggingEnabled() {
    return this.get('/settings/debug/is-enabled').subscribe(resp => {
      this.debugEnabled = resp.enabled;
    });
  }

  private extractData = (res: Response) => {
    return res.json();
  }

  private get(url) {
    return this.http.get(url).map(this.extractData);
  }

  private post(url, data) {
    return this.http.post(url, data).map(this.extractData);
  }
}
